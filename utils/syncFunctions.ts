import { ISyncRecord } from '../interfaces/interfaces';
import { isTypeIInventoryOperation, isTypeIInventoryOperationDescription, isTypeIRouteTransaction, isTypeIRouteTransactionOperation, isTypeIRouteTransactionOperationDescription } from './guards';
import TABLES from './tables';


export function createSyncItem(data:any,
  status:'PENDING'|'SUCCESS'|'FAILED',
  action:'INSERT'|'UPDATE'|'DELETE'):ISyncRecord {
  let syncItem:ISyncRecord = {
    id_record:  '',
    status:     'FAILED',
    payload:    {},
    table:      '',
    action:     'INSERT',
  };

  if (isTypeIInventoryOperation(data)) {
    syncItem.id_record = data.id_inventory_operation;
    syncItem.table = TABLES.INVENTORY_OPERATIONS;
  } else if (isTypeIInventoryOperationDescription(data)) {
    syncItem.id_record = data.id_product_operation_description;
    syncItem.table = TABLES.INVENTORY_OPERATION_TYPES;
  } else if (isTypeIRouteTransaction(data)) {
    syncItem.id_record = data.id_route_transaction;
    syncItem.table = TABLES.ROUTE_TRANSACTIONS;
  } else if (isTypeIRouteTransactionOperation(data)) {
    syncItem.id_record = data.id_route_transaction_operation;
    syncItem.table = TABLES.ROUTE_TRANSACTION_OPERATIONS;
  } else if (isTypeIRouteTransactionOperationDescription(data)) {
    syncItem.id_record = data.id_route_transaction_operation_description;
    syncItem.table = TABLES.ROUTE_TRANSACTION_OPERATIONS_DESCRIPTONS;
  } else if (isTypeIRouteTransactionOperationDescription(data)) {
    /* TODO: GENERAL TYPE INFORMATION*/
  } else {
    /* Other type of records that is not supported*/
  }

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
      table:      '',
      action:     'INSERT',
    };

    let data = arrData[i];

    if (isTypeIInventoryOperation(data)) {
      syncItem.id_record = data.id_inventory_operation;
      syncItem.table = TABLES.INVENTORY_OPERATIONS;
    } else if (isTypeIInventoryOperationDescription(data)) {
      syncItem.id_record = data.id_product_operation_description;
      syncItem.table = TABLES.INVENTORY_OPERATION_TYPES;
    } else if (isTypeIRouteTransaction(data)) {
      syncItem.id_record = data.id_route_transaction;
      syncItem.table = TABLES.ROUTE_TRANSACTIONS;
    } else if (isTypeIRouteTransactionOperation(data)) {
      syncItem.id_record = data.id_route_transaction_operation;
      syncItem.table = TABLES.ROUTE_TRANSACTION_OPERATIONS;
    } else if (isTypeIRouteTransactionOperationDescription(data)) {
      syncItem.id_record = data.id_route_transaction_operation_description;
      syncItem.table = TABLES.ROUTE_TRANSACTION_OPERATIONS_DESCRIPTONS;
    } else {
      /* Other type of records that is not supported*/
    }

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

