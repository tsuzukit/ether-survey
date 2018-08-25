pragma solidity ^0.4.23;

import "./Survey.sol";

/** @title SurveyFactory. */
contract SurveyFactory {

  address[] public deployedSurvey;

  /** @dev create survey
    * @param description survey description.
    * @param questions questions in json format.
    * @return durationInMinutes survey will end after this period of time.
    * @return tokenAddress ERC20 address used as reward.
    */
  function createSurvey(string description, string questions, uint durationInMinutes, address tokenAddress) public {
    if (durationInMinutes == 0) {
      revert("durationInMinutes should not be 0");
    }

    address newSurvey = new Survey(description, questions, durationInMinutes, tokenAddress, msg.sender);
    deployedSurvey.push(newSurvey);
  }

  /** @dev get survey deployed with this factory. */
  function getDeployedSurvey() public view returns (address[]) {
    return deployedSurvey;
  }

  /** @dev answer survey via factory.
    * @param surveyAddress survey contract address.
    * @param answer json format answer.
    */
  function answerSurvey(address surveyAddress, string answer) public {
    Survey survey = Survey(surveyAddress);
    survey.answer(answer, msg.sender);
  }

}
