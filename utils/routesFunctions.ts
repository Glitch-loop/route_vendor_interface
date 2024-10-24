// Libraries
import 'react-native-get-random-values'; // Necessary for uuid
import {v4 as uuidv4 } from 'uuid';

// Interfaces
import { enumStoreStates } from '../interfaces/enumStoreStates';
import {
  IDayOperation,
  IRouteDayStores,
  IStore,
  IStoreStatusDay,
 } from '../interfaces/interfaces';

// Utils
import DAYS_OPERATIONS from '../lib/day_operations';

// Related to route plannification
export function planningRouteDayOperations(arrRouteDayStores: IRouteDayStores[]):IDayOperation[] {
  const arrDayOperations:IDayOperation[] = [];

  arrRouteDayStores.forEach(routeDayStore => {
    arrDayOperations.push({
      id_day_operation: uuidv4(),
      id_item: routeDayStore.id_store,
      id_type_operation: DAYS_OPERATIONS.sales,
      operation_order: routeDayStore.position_in_route,
      current_operation: 0,
    });
  });

  return arrDayOperations;
}

// Related to store context
export function getColorContextOfStore(store:IStore&IStoreStatusDay, currentOperation:IDayOperation) {
  let style = '';

  if (currentOperation.current_operation === 1) {
    style = 'flex flex-row h-6 w-6 bg-indigo-500 rounded-full';
  } else {
    if (store.route_day_state === enumStoreStates.NEW_CLIENT) {
      style = 'flex flex-row h-6 w-6 bg-green-400 rounded-full';
    } else if (store.route_day_state === enumStoreStates.SPECIAL_SALE) {
      style = 'flex flex-row h-6 w-6 bg-green-600 rounded-full';
    } else if (store.route_day_state === enumStoreStates.REQUEST_FOR_SELLING) {
      style = 'flex flex-row h-6 w-6 bg-amber-500 rounded-full';
    } else if (store.route_day_state === enumStoreStates.SERVED) {
      style = 'flex flex-row h-6 w-6 bg-amber-200/75 rounded-full';
    } else {
      style = 'flex flex-row h-6 w-6 bg-amber-200/75 rounded-full';
    }
  }

  return style;
}
