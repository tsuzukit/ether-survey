pragma solidity ^0.4.23;

import "../installed_contracts/zeppelin/contracts/ownership/Ownable.sol";
import "../installed_contracts/zeppelin/contracts/math/SafeMath.sol";

interface token {
    function transfer(address receiver, uint amount) external;
    function balanceOf(address add) external view returns (uint256);
}

/** @title Survey. */
contract Survey is Ownable {

  using SafeMath for uint;

  struct Answer {
    string answer;
    bool exist;
    bool withdrawn;
  }

  token public tokenReward;
  address public manager;
  uint public deadline;
  string public description;
  string public questions;
  bool private stopped = false;

  mapping(address => Answer) private answers;
  address[] private respondent;

  /** @dev constructor
    * @param _description survey description.
    * @param _questions questions in json format.
    * @return _durationInMinutes survey will end after this period of time.
    * @return tokenAddress ERC20 address used as reward.
    */
  constructor(string _description, string _questions, uint _durationInMinutes, address tokenAddress, address _owner) public {
    description = _description;
    questions = _questions;
    deadline = now.add(_durationInMinutes.mul(1 minutes));
    owner = _owner;
    manager = msg.sender;
    tokenReward = token(tokenAddress);
  }

  /** @dev make sure survey is before deadline. */
  modifier beforeDeadline() {
    require(now <= deadline);
    _;
  }

  /** @dev make sure survey is after deadline. */
  modifier afterDeadline() {
    require(now > deadline);
    _;
  }

  /** @dev make sure survey still has some reward left for respondent. */
  modifier rewardLeft() {
    require(getRewardLeft() >= 1);
    _;
  }

  /** @dev make sure msg.sender is manager. */
  modifier onlyManager() {
    require(msg.sender == manager);
    _;
  }

  /** @dev make sure contract is not stopped. */
  modifier stopInEmergency { 
    require(!stopped);
    _;
  }

  /** @dev return summary of survey. */
  function getSummary() public view returns (address, string, string, uint, uint, address, uint) {
    return (
      this,
      description,
      questions,
      respondent.length,
      tokenReward.balanceOf(this),
      owner,
      deadline
    );
  }

  /** @dev stop contract for emergency situation. */
  function stopContract() public onlyOwner {
    stopped = true;
  }

  /** @dev activate contract when emergency situation is over. */
  function activateContract() public onlyOwner {
    stopped = false;
  }

  /** @dev return ERC20 reward still available to respondent. */
  function getRewardLeft() public view returns (uint) {
    return tokenReward.balanceOf(this).sub(respondent.length);
  }

  /** @dev answer survey
    * this method can only be called by survey factory contract
    * in the future, survey factory can implement more safety measure
    * @param a json format answer.
    * @param responder address of survey taker.
    */
  function answer(string a, address responder) 
    public 
    rewardLeft
    beforeDeadline
    onlyManager
    stopInEmergency
  {
    if (answers[responder].exist) {
      revert("Already answered");
    }

    respondent.push(responder);
    answers[responder] = Answer({ answer:a, exist: true, withdrawn: false });
  }

  /** @dev get answer by specified address
    * @param add address of survey taker.
    */
  function getAnswer(address add) public view returns(string) {
    return answers[add].answer; 
  }

  /** @dev get respondent addresses. */
  function getRespondent() public view returns(address[]) {
    return respondent; 
  }

  /** @dev withdraw ERC20 token after survey. */
  function withdrawToken() public afterDeadline stopInEmergency {
    if (msg.sender == owner) {

      // if you are owner, you can withdraw every token left over
      uint leftOver = tokenReward.balanceOf(this).sub(respondent.length);
      if (leftOver > 1) {
        tokenReward.transfer(msg.sender, leftOver);
      }

    } else {

      // if you are respondent, you can get 1 token
      Answer storage a = answers[msg.sender];
      if (a.exist && !a.withdrawn) {
        a.withdrawn = true;
        tokenReward.transfer(msg.sender, 1);
      }
    }
  }

}