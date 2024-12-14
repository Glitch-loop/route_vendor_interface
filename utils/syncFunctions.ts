import { ISyncRecord } from '../interfaces/interfaces';
import { isTypeIInventoryOperation, isTypeIInventoryOperationDescription, isTypeIRouteTransaction, isTypeIRouteTransactionOperation, isTypeIRouteTransactionOperationDescription, isTypeWorkDayInstersection } from './guards';
import TABLES from './tables';

function determiningInterfaceToCreateSynItem(syncItem:ISyncRecord, data:any)
:ISyncRecord {
  if (isTypeIInventoryOperation(data)) {
    console.log("is inventory operation")
    syncItem.id_record = data.id_inventory_operation;
    syncItem.table_name = TABLES.INVENTORY_OPERATIONS;
  } else if (isTypeIInventoryOperationDescription(data)) {
    console.log("is inventory operation description: ")
    syncItem.id_record = data.id_product_operation_description;
    syncItem.table_name = TABLES.INVENTORY_OPERATION_TYPES;
  } else if (isTypeIRouteTransaction(data)) {
    console.log("is route transaction")
    syncItem.id_record = data.id_route_transaction;
    syncItem.table_name = TABLES.ROUTE_TRANSACTIONS;
  } else if (isTypeIRouteTransactionOperation(data)) {
    console.log("is route transaction operation")
    syncItem.id_record = data.id_route_transaction_operation;
    syncItem.table_name = TABLES.ROUTE_TRANSACTION_OPERATIONS;
  } else if (isTypeIRouteTransactionOperationDescription(data)) {
    console.log("is route transaction operation description")
    syncItem.id_record = data.id_route_transaction_operation_description;
    syncItem.table_name = TABLES.ROUTE_TRANSACTION_OPERATIONS_DESCRIPTONS;
  } else if(isTypeWorkDayInstersection(data)){
    console.log("Is work day intersection")
    syncItem.id_record = data.id_work_day;
    syncItem.table_name = TABLES.WORK_DAYS;
  } else {
    /* Other type of records that is not supported*/
  }

  return syncItem;

}

export function createSyncItem(data:any,
  status:'PENDING'|'SUCCESS'|'FAILED',
  action:'INSERT'|'UPDATE'|'DELETE'):ISyncRecord {
  let syncItem:ISyncRecord = {
    id_record:  '',
    status:     'FAILED',
    payload:    {},
    table_name:      '',
    action:     'INSERT',
  };

  syncItem = determiningInterfaceToCreateSynItem(syncItem, data);

  if (syncItem.id_record !== '') {
    /* It means the type of record was identified. */
    syncItem.status = status;
    syncItem.payload = JSON.stringify(data);
    syncItem.action = action;
  } else {
    /* The records wasn't identified. */
  }

  return syncItem;
}


export function createSyncItems(arrData:any[],
  status:'PENDING'|'SUCCESS'|'FAILED',
  action:'INSERT'|'UPDATE'|'DELETE'):ISyncRecord[] {
  let totalNumberRecords:number = arrData.length;
  let recordsToSync:ISyncRecord[] = [];

  for (let i = 0; i < totalNumberRecords; i++) {
    let syncItem:ISyncRecord = {
      id_record:  '',
      status:     'FAILED',
      payload:    {},
      table_name:      '',
      action:     'INSERT',
    };

    let data = arrData[i];

    syncItem = determiningInterfaceToCreateSynItem(syncItem, data);

    if (syncItem.id_record !== '') {
      /* It means the type of record was identified. */
      syncItem.status = status;
      syncItem.payload = JSON.stringify(data);
      syncItem.action = action;

      recordsToSync.push(syncItem);
    } else {
      /* The records wasn't identified. */
      recordsToSync.push(syncItem);
      break;
    }

  }

  return recordsToSync;
}

