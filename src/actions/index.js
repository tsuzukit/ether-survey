import getWeb3 from '../utils/getWeb3'
import SurveyTokenContract from '../../build/contracts/SurveyToken.json'
import SurveyFactoryContract from '../../build/contracts/SurveyFactory.json'
import SurveyContract from '../../build/contracts/Survey.json'

export const INITIALIZE_WEB3 = "INITIALIZE_WEB3";
export const ANSWER_SURVEY = "ANSWER_SURVEY";
export const CREATE_SURVEY = "CREATE_SURVEY";
export const CHARGE_TOKEN = "CHARGE_TOKEN";
export const RETREIVE_TOKEN = "RETREIVE_TOKEN";
export const GET_RESPONDENT = "GET_RESPONDENT";
export const GET_TOKEN_BALANCE = "GET_TOKEN_BALANCE";
export const GET_SURVEY_ADDRESSES = "GET_SURVEY_ADDRESSES";
export const GET_SURVEY_SUMMARY = "GET_SURVEY_SUMMARY";
export const GET_SURVEY_ANSWER = "GET_SURVEY_ANSWER";

export function initializeWeb3(onFinish) {
  const request = getWeb3

  return {
    type: INITIALIZE_WEB3,
    payload: request,
  };
}

export async function getTokenBalance(web3, accounts) {

  let token = await getTokenInstance(web3);
  let balance = token.balanceOf.call(accounts[0])

  return {
    type: GET_TOKEN_BALANCE,
    payload: balance
  };
}

export async function getSurveyAddresses(web3, onFinish) {

  let factory = await getFactoryInstance(web3);
  let surveyAddresses = factory.getDeployedSurvey.call().then((addresses) => onFinish(addresses));

  return {
    type: GET_SURVEY_ADDRESSES,
    payload: surveyAddresses
  };
}

export async function getSurveySummary(web3, address) {

  let survey = await getSurveyInstance(web3, address);
  let surveySummary = survey.getSummary.call();

  return {
    type: GET_SURVEY_SUMMARY,
    payload: surveySummary
  };
}

export async function createSurvey(web3, accounts, description, duration, questions, onFinish, onError) {

  let token = await getTokenInstance(web3);
  let factory = await getFactoryInstance(web3);
  const durationInMinutes = duration;

  factory.createSurvey(description, questions, durationInMinutes, token.address, {from: accounts[0]})
  .then((result) => {
    onFinish();
  }).catch((err) => {
    onError(err);
  });

  return {
    type: CREATE_SURVEY,
    payload: null
  };
}

export async function answerSurvey(web3, accounts, surveyAddress, answers, onFinish, onError) {

  let factory = await getFactoryInstance(web3);
  
  factory.answerSurvey(surveyAddress, answers, {
    from: accounts[0],
    gas: 1000000,
  })
  .then( () => onFinish() )
  .catch( (err) => onError(err))

  return {
    type: ANSWER_SURVEY,
    payload: null
  };
}

export async function chargeToken(web3, accounts, surveyAddresses, chargeAmount, onFinish, onError) {

  let token = await getTokenInstance(web3);

  token.transfer(surveyAddresses, chargeAmount, {from: accounts[0]})
    .then( () => onFinish() )
    .catch( (err) => onError(err))

  return {
    type: CHARGE_TOKEN,
    payload: token
  };
}

export async function retreiveToken(web3, accounts, surveyAddress, onFinish, onError) {

  let survey = await getSurveyInstance(web3, surveyAddress);

  survey.withdrawToken({
    from: accounts[0],
    gas: 1000000,
  })
    .then( () => onFinish() )
    .catch( (err) => onError(err))

  return {
    type: RETREIVE_TOKEN,
    payload: null
  };
}

export async function getRespondent(web3, surveyAddress, onFinish, onError) {

  let survey = await getSurveyInstance(web3, surveyAddress);

  let respondent = survey.getRespondent.call()
    .then( (respondent) => onFinish(respondent) )
    .catch( (err) => onError(err))

  return {
    type: RETREIVE_TOKEN,
    payload: respondent
  };
}

export async function getAnswer(web3, surveyAddress, respondent, onFinish, onError) {

  let survey = await getSurveyInstance(web3, surveyAddress);

  let answer = survey.getAnswer.call(respondent)
    .then( (answer) => onFinish(answer) )
    .catch( (err) => onError(err))

  return {
    type: GET_SURVEY_ANSWER,
    payload: answer,
    address: surveyAddress,
  };
}

async function getTokenInstance(web3) {
    const contract = require('truffle-contract')
    const surveyToken = contract(SurveyTokenContract)
    surveyToken.setProvider(web3.currentProvider)

    let surveyTokenInstance = await surveyToken.deployed()
    return surveyTokenInstance;
}

async function getFactoryInstance(web3) {
    const contract = require('truffle-contract')
    const surveyFactory = contract(SurveyFactoryContract)
    surveyFactory.setProvider(web3.currentProvider)

    let surveyFactoryInstance = await surveyFactory.deployed()
    return surveyFactoryInstance;
}

async function getSurveyInstance(web3, address) {
    const contract = require('truffle-contract')
    const survey = contract(SurveyContract)
    survey.setProvider(web3.currentProvider)

    let surveyInstance = await survey.at(address)
    return surveyInstance;
}