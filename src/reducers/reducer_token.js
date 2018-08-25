import { GET_TOKEN_BALANCE, CHARGE_TOKEN } from '../actions/index';

export default function(state = {}, action) {

  switch(action.type) {
    case GET_TOKEN_BALANCE:
      return { ...state, "balance": parseInt(action.payload, 10) }
    case CHARGE_TOKEN:
      return state;
    default:
      return state;
  }

}