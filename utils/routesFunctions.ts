// Libraries
import 'react-native-get-random-values'; // Necessary for uuid
import {v4 as uuidv4 } from 'uuid';

// Interfaces
import { IDayOperation, IRouteDayStores } from '../interfaces/interfaces';
import DAYS_OPERATIONS from '../lib/day_operations';

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
