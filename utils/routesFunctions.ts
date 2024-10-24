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
    style = 'bg-indigo-500'; // Current store (client of the route)
  } else {
    if (store.route_day_state === enumStoreStates.NEW_CLIENT) {
      style = 'bg-green-400'; // New client
    } else if (store.route_day_state === enumStoreStates.SPECIAL_SALE) {
      style = 'bg-orange-600'; // Selling for a client that is outside of the route.
    } else if (store.route_day_state === enumStoreStates.REQUEST_FOR_SELLING) {
      // Client that asked to be visited (he doesn't belong to the current route)
      style = 'bg-amber-500';
    } else if (store.route_day_state === enumStoreStates.SERVED) {
      style = 'bg-amber-200/75'; // Client of the route that has been visited.
    } else {
      style = 'bg-amber-300'; // Client of the current route that is pending to visit. 
    }
  }

  return style;
}

export function getStoreFromContext(currentOperation:IDayOperation, stores:(IStore&IStoreStatusDay)[]):IStore&IStoreStatusDay {
  const emptyStore:IStore&IStoreStatusDay = {
    id_store: '',
    street: '',
    ext_number: '',
    colony: '',
    postal_code: '',
    address_reference: '',
    store_name: '',
    owner_name: '',
    cellphone: '',
    latitude: '',
    longuitude: '',
    id_creator: 0,
    creation_date: '',
    creation_context: '',
    status_store: '',
    route_day_state: 0,
  };

  const foundStore: (IStore & IStoreStatusDay) |undefined = stores
    .find(store => store.id_store === currentOperation.id_item);

  if(foundStore === undefined) {
    return emptyStore;
  } else {
    return foundStore;
  }
}
