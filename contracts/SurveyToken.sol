pragma solidity ^0.4.23;

import "../installed_contracts/zeppelin/contracts/token/StandardToken.sol";

/** @title SurveyToken.
  * Simple ERC20 token.
  */
contract SurveyToken is StandardToken {
  string public name = "SurveyToken";
  string public symbol = "SVTK";
  uint public decimals = 18;

  /** @dev constructor
    * @param initialSupply token initial supply.
    */
  constructor(uint initialSupply) public {
    totalSupply = initialSupply;
    balances[msg.sender] = initialSupply;
  }

}