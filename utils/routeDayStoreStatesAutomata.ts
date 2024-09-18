import { enumStoreStates } from '../interfaces/enumStoreStates';

export function determineRouteDayState(currentState:enumStoreStates, nextState:number) {
  let newState:enumStoreStates = currentState;

  switch (currentState){
    case enumStoreStates.NUETRAL_STATE:
      if (nextState === 1) {
        newState = enumStoreStates.PENDING_TO_VISIT;
      } else if (nextState === 3) {
        newState = enumStoreStates.REQUEST_FOR_SELLING;
      } else if (nextState === 5) {
        newState = enumStoreStates.SPECIAL_SALE;
      } else if (nextState === 6) {
        newState = enumStoreStates.NEW_CLIENT;
      } else {
        newState = enumStoreStates.NUETRAL_STATE;
      }
      break;
    case enumStoreStates.PENDING_TO_VISIT:
      if (nextState === 2) {
        newState = enumStoreStates.SERVED;
      } else {
        newState = enumStoreStates.PENDING_TO_VISIT;
      }
      break;
    case enumStoreStates.REQUEST_FOR_SELLING:
      if (nextState === 4) {
        newState = enumStoreStates.SPECIAL_SALE;
      } else {
        newState = enumStoreStates.REQUEST_FOR_SELLING;
      }
      break;
    default:
      newState = currentState;
    }
    return newState;
}
