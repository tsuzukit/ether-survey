import { GET_SURVEY_SUMMARY } from '../actions/index';

export default function(state = {}, action) {

  switch(action.type) {
    case GET_SURVEY_SUMMARY:
      return { ...state, [action.payload[0]]: action.payload }
    default:
      return state;
  }

}