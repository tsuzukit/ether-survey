var SurveyFactory = artifacts.require("./SurveyFactory.sol");
var Survey = artifacts.require("./Survey.sol");
var SurveyToken = artifacts.require("./SurveyToken.sol");

contract('SurveyFactory', function(accounts) {

  const surveyDescription = 'Test survey name';
  const surveyQuestions = '[{}]';
  const surveyDurationInMinutes = 1;

  let factory;
  let survey;
  let token;

  beforeEach(async () =>{
    // deploy and get token instance
    token = await SurveyToken.deployed();
  });

  // Make sure SurveyFactory is succesfully deployed
  it("should be able to deploy SurveyFactory", async () => {
    // deploy and get survey factory instance
    factory = await SurveyFactory.deployed();
    assert.isNotNull(factory);
  });

  // Make sure SurveyFactory can create new survey and it's address is listed in factories's storage
  it("should be able to create new survey", async () => {
    // create survey
    await factory.createSurvey(surveyDescription, surveyQuestions, surveyDurationInMinutes, token.address, {from: accounts[0]});

    // get deployed survey
    let deployed = await factory.getDeployedSurvey.call();

    // make sure survey is created and listed
    assert.isAtLeast(deployed.length, 1);

    // get survey
    survey = Survey.at(deployed[deployed.length - 1]);
    assert.isNotNull(survey.address);

    // get manager address
    let managerAddress = await survey.manager.call();
    assert.equal(factory.address, managerAddress);
  });

  // Make sur eany user can create survey
  it("should be able to create new survey by any user", async () => {
    // create survey
    await factory.createSurvey(surveyDescription, surveyQuestions, surveyDurationInMinutes, token.address, {from: accounts[0]});
    await factory.createSurvey(surveyDescription, surveyQuestions, surveyDurationInMinutes, token.address, {from: accounts[1]});
    await factory.createSurvey(surveyDescription, surveyQuestions, surveyDurationInMinutes, token.address, {from: accounts[2]});

    // deploy multiple survey
    let deployed = await factory.getDeployedSurvey.call();

    // make sure survey is created and listed
    assert.isAtLeast(deployed.length, 3);
  });

  // Make sure SurveyFactory throws error if token address is invalid
  it("should not be able to create new survey if token address is invalid", async () => {
    let error;
    try {
      await factory.createSurvey(surveyDescription, surveyQuestions, surveyDurationInMinutes, "foobar", {from: accounts[0]});
    } catch (err) {
      error = err;
    }

    // error should not be null
    if (error == null) {
      assert.isTrue(false);
    }
  });

  // Make sure SurveyFactory throws error if duration is 0, as it does not give user time to answer survey at all
  it("should not be able to create new survey if duration is 0", async () => {
    let error;
    try {
      await factory.createSurvey(surveyDescription, surveyQuestions, 0, token.address, {from: accounts[0]});
    } catch (err) {
      error = err;
    }

    // error should not be null
    if (error == null) {
      assert.isTrue(false);
    }
  });

});
