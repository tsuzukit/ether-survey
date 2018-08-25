var SurveyFactory = artifacts.require("./SurveyFactory.sol");
var Survey = artifacts.require("./Survey.sol");
var SurveyToken = artifacts.require("./SurveyToken.sol");

const increaseTime = function(duration) {
  const id = Date.now();
  web3.currentProvider.sendAsync({
    jsonrpc: '2.0',
    method: 'evm_increaseTime',
    params: [duration],
    id: id,
  }, err1 => {
    if (!err1) {
      web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_mine',
        params: [],
        id: new Date().getSeconds()
      });
    }
  })
};

contract('Survey', function(accounts) {

  const surveyDescription = 'Survey about Japan';
  const surveyQuestions = '[{"type":"AB_question","question":"Which do you like?","A":"Red","B":"Blue"},{"type":"Open_question","question":"What do you think of Japan?"}]';
  const surveyDurationInMinutes = 10;
  const answer = '[{"answer":"A"},{"answer":"I love that country!"}]';
  const newAnswer = '[{"answer":"B"},{"answer":"I want to answer twice!"}]';

  let factory;
  let survey;
  let token;

  beforeEach(async () =>{
    // deploy and get token instance
    token = await SurveyToken.deployed();

    // deploy and get survey factory instance
    factory = await SurveyFactory.deployed();

    // create survey
    await factory.createSurvey(surveyDescription, surveyQuestions, surveyDurationInMinutes, token.address, {from: accounts[0]});
    let deployed = await factory.getDeployedSurvey.call();
    survey = Survey.at(deployed[deployed.length - 1]);
  });

  // Make sure survey information can be retreived properly
  it("should have correct survey info", async () => {
    let summary = await survey.getSummary.call();

    assert.equal(survey.address, summary[0]);
    assert.equal(surveyDescription, summary[1]);
    assert.equal(surveyQuestions, summary[2]);
    assert.equal(0, summary[3]);
    assert.equal(0, summary[4]);
    assert.equal(accounts[0], summary[5]);
  });

  // Make sure survey cannot be answered when there is no reward
  it("can not answer survey because there is no token left", async () => {
    let error;
    try {
      await factory.answerSurvey(survey.address, answer, {from: accounts[1]});
    } catch (err) {
      error = err;
    }

    // error should not be null
    if (error == null) {
      assert.isTrue(false);
    }
  });

  // Make sure survey reward can be charged with reward ERC20
  it("should charge and reflect", async () => {
    // charge token to surevy
    await token.transfer(survey.address, 100, {from: accounts[0]});

    let summary = await survey.getSummary.call();
    assert.equal(100, summary[4]);

    let rewardLeft = await survey.getRewardLeft.call();
    assert.equal(100, rewardLeft);
  });

  // Make sure survey owner can make survey to emergency mode
  it("allows only owner to put survey in emergency", async () => {
    // stop contract
    let error;
    try {
      await survey.stopContract({from: accounts[1]})
    } catch (err) {
      error = err;
    }

    // error should not be null
    if (error == null) {
      assert.isTrue(false);
    }

    // stop contract
    try {
      await survey.stopContract({from: accounts[0]})
      error = null;
    } catch (err) {
      error = err;
    }

    // error should be null
    if (error != null) {
      assert.isTrue(false);
    }

  });

  // Make sure no one can answer survey when in emergency mode
  it("canot answer survey in emergency", async () => {
    // charge token to surevy
    await token.transfer(survey.address, 100, {from: accounts[0]});

    // stop contract
    await survey.stopContract({from: accounts[0]})

    // try to answer
    let error;
    try {
      await factory.answerSurvey(survey.address, answer, {from: accounts[1]});
    } catch (err) {
      error = err;
    }

    // error should not be null
    if (error == null) {
      assert.isTrue(false);
    }
  });

  // Make sure survey can be answred when there is reward left and it is before closing time
  it("can answer survey after charge", async () => {
    // charge token to surevy
    await token.transfer(survey.address, 100, {from: accounts[0]});

    // answer
    await factory.answerSurvey(survey.address, answer, {from: accounts[1]});

    let respondent = await survey.getRespondent.call();
    assert.equal(accounts[1], respondent[respondent.length - 1]);

    let retrievedAnswer = await survey.getAnswer.call(accounts[1]);
    assert.equal(answer, retrievedAnswer);
  });

  // Make sure same ether account can only answer 1 time to same survey
  it("cannot answer survey twice", async () => {
    // charge token to surevy
    await token.transfer(survey.address, 100, {from: accounts[0]});

    // answer
    await factory.answerSurvey(survey.address, answer, {from: accounts[1]});

    // answer twice should not happen
    let error;
    try {
      await factory.answerSurvey(survey.address, newAnswer, {from: accounts[1]});
    } catch (err) {
      error = err;
    }
    if (error == null) {
      assert.isTrue(false);
    }

    // answer should not upadted and stays as old one
    let retrievedAnswer = await survey.getAnswer.call(accounts[1]);
    assert.equal(answer, retrievedAnswer);
  });

  // Make sure survey can only be answered through survey factory contract
  it("cannot answer survey directly", async () => {
    try {
      await survey.answer(newAnswer, {from: accounts[2]});
      assert(false);
    } catch (err) {
      assert(true);
    }

    // answer should not be saved
    let retrievedAnswer = await survey.getAnswer.call(accounts[2]);
    assert.equal("", retrievedAnswer);
  });

  // Make sure survey cannot be answered after deadline
  it("cannot answer after deadline", async () => {
    // charge token to surevy
    await token.transfer(survey.address, 100, {from: accounts[0]});

    // increase time
    increaseTime(1000);

    // answer twice should not happen
    let error;
    try {
      await factory.answerSurvey(survey.address, newAnswer, {from: accounts[1]});
    } catch (err) {
      error = err;
    }
    if (error == null) {
      assert.isTrue(false);
    }
  });

  // Make sure survey reward cannot be withdrawn before deadline
  it("cannot withdraw before deadline", async () => {
    // charge token to surevy
    await token.transfer(survey.address, 100, {from: accounts[0]});

    // answer
    await factory.answerSurvey(survey.address, newAnswer, {from: accounts[1]});

    // cannot withdraw before deadline
    let error;
    try {
      await survey.withdrawToken({from: accounts[0]});
    } catch (err) {
      error = err;
    }
    if (error == null) {
      assert.isTrue(false);
    }
  });

  // Make sure survey reward can be withdrawn after deadline
  it("can withdraw after deadline", async () => {
    // charge token to surevy
    await token.transfer(survey.address, 100, {from: accounts[0]});
    let managerAmountAfterCharge = await token.balanceOf.call(accounts[0])

    // answer
    await factory.answerSurvey(survey.address, newAnswer, {from: accounts[1]});

    // increase time
    increaseTime(1000);

    // withdraw as manager
    await survey.withdrawToken({from: accounts[0]});
    let managerAmount = await token.balanceOf.call(accounts[0])
    assert.equal(parseInt(managerAmountAfterCharge) + 99, managerAmount);

    // withdraw as respondent
    await survey.withdrawToken({from: accounts[1]});
    let respondentAmount = await token.balanceOf.call(accounts[1])
    assert.equal(1, respondentAmount);

    // cannot withdraw twice
    await survey.withdrawToken({from: accounts[1]});
    let respondentAmount2 = await token.balanceOf.call(accounts[1])
    assert.equal(1, respondentAmount2);
  });

  // Make sure survey reward cannot be withdrawn when at emergency
  it("cannot withdraw after deadline but in emergency", async () => {
    // charge token to surevy
    await token.transfer(survey.address, 100, {from: accounts[0]});
    let managerAmountAfterCharge = await token.balanceOf.call(accounts[0])

    // answer
    await factory.answerSurvey(survey.address, newAnswer, {from: accounts[1]});

    // increase time
    increaseTime(1000);

    // stop contract
    await survey.stopContract({from: accounts[0]})

    // withdraw as manager
    let error;
    try {
      await survey.withdrawToken({from: accounts[0]});
    } catch (err) {
      error = err;
    }
    if (error == null) {
      assert.isTrue(false);
    }

    // withdraw as respondent
    error = null;
    try {
      await survey.withdrawToken({from: accounts[1]});
    } catch (err) {
      error = err;
    }
    if (error == null) {
      assert.isTrue(false);
    }

  });

});
