var SurveyFactory = artifacts.require("./SurveyFactory.sol");
var SurveyToken = artifacts.require("./SurveyToken.sol");

module.exports = function(deployer) {
  deployer.deploy(SurveyFactory);
  deployer.deploy(SurveyToken, 10000);
};
