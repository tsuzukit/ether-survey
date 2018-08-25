import { GET_SURVEY_ADDRESSES } from '../actions/index';

export default function(state = {}, action) {

  switch(action.type) {
    case GET_SURVEY_ADDRESSES:
      return { ...state, "surveyAddresses": action.payload }
    default:
      return state;
  }

}