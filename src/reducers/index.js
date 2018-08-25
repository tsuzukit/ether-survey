import { combineReducers } from 'redux';
import Web3Reducer from './reducer_web3';
import TokenReducer from './reducer_token';
import FactoryReducer from './reducer_factory';
import SurveyReducer from './reducer_survey';
import { reducer as formReducer } from 'redux-form';

const rootReducer = combineReducers({
  web3Obj: Web3Reducer,
  token: TokenReducer,
  factory: FactoryReducer,
  surveys: SurveyReducer,
  form: formReducer,
});

export default rootReducer;
