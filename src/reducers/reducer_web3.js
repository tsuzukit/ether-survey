import { INITIALIZE_WEB3 } from '../actions/index';

export default function(state = {}, action) {

  switch(action.type) {
    case INITIALIZE_WEB3:
      return {
        web3: action.payload.web3,
        accounts: action.payload.accounts,
      };
    default:
      return state;
  }

}