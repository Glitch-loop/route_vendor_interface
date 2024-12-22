import { ISyncRecord } from '../interfaces/interfaces';
import {
  isTypeIInventoryOperation,
  isTypeIInventoryOperationDescription,
  isTypeIRouteTransaction,
  isTypeIRouteTransactionOperation,
  isTypeIRouteTransactionOperationDescription,
  isTypeWorkDayInstersection,
} from './guards';
import { time_posix_format } from './momentFormat';
import TABLES from './tables';

function determiningInterfaceToCreateSyncItem(syncItem:ISyncRecord, data:any)
:ISyncRecord {
  if (isTypeIInventoryOperation(data)) {
    syncItem.id_record = data.id_inventory_operation;
    syncItem.table_name = TABLES.INVENTORY_OPERATIONS;
  } else if (isTypeIInventoryOperationDescription(data)) {
    syncItem.id_record = data.id_product_operation_description;
    syncItem.table_name = TABLES.INVENTORY_OPERATION_TYPES;
  } else if (isTypeIRouteTransaction(data)) {
    syncItem.id_record = data.id_route_transaction;
    syncItem.table_name = TABLES.ROUTE_TRANSACTIONS;
  } else if (isTypeIRouteTransactionOperation(data)) {
    syncItem.id_record = data.id_route_transaction_operation;
    syncItem.table_name = TABLES.ROUTE_TRANSACTION_OPERATIONS;
  } else if (isTypeIRouteTransactionOperationDescription(data)) {
    syncItem.id_record = data.id_route_transaction_operation_description;
    syncItem.table_name = TABLES.ROUTE_TRANSACTION_OPERATIONS_DESCRIPTONS;
  } else if(isTypeWorkDayInstersection(data)){
    syncItem.id_record = data.id_work_day;
    syncItem.table_name = TABLES.WORK_DAYS;
  } else {
    /* Other type of records that is not supported*/
  }

  return syncItem;

}

function determiningWeightDependingOnRecordType(recordType:any):number {
  let weight = 0;
  if(isTypeWorkDayInstersection(recordType)) {
    weight = 1;
  } else if(isTypeIInventoryOperation(recordType) || isTypeIRouteTransaction(recordType)) {
    weight = 2;
  } else if(isTypeIInventoryOperationDescription(recordType)
         || isTypeIRouteTransactionOperation(recordType)) {
    weight = 3;
  } else if(isTypeIRouteTransactionOperationDescription(recordType)) {
    weight = 4;
  } else {
    weight = 0;
  }

  return weight;
}

export function createSyncItem(
  data:any,
  status:'PENDING'|'SUCCESS'|'FAILED',
  action:'INSERT'|'UPDATE'|'DELETE'
):ISyncRecord {
  let syncItem:ISyncRecord = {
    id_record:  '',
    status:     'FAILED',
    payload:    {},
    table_name:      '',
    action:     'INSERT',
    timestamp:  JSON.stringify(time_posix_format()),
  };

  syncItem = determiningInterfaceToCreateSyncItem(syncItem, data);

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
      timestamp:  JSON.stringify(time_posix_format()),
    };

    let data = arrData[i];

    syncItem = determiningInterfaceToCreateSyncItem(syncItem, data);

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

/*
  To avoid "logic collision" at the moment of insert (or make any other movement)
  with the database resulting of the synchronization, it must be followed a
  "prioritization".

  Since the synchronization of records must be follow an heirachy dependncy it is
  not enoguh to just simply follow an FIFO strategy using time as the factor to
  organize the records, so it is necessary to calculate a "priority factor" that
  allow us to determine which record must be synced first.

  Here are the "concepts" that influences in the priority calculation
  (they are in order of importance):
    1. By type of record
    2. By type of action
    3. By time

  At the moment of write this, these are the type of records ordered from
  the most important to the least importance.

  Description for each concept
  1. By type of record:
    Order between records (each one represents a interface or a intersection):
        1. Work day intersection (IRoute&IDayGeneralInformation&IDay&IRouteDay)
        2.
          IInventoryOperation
          IRouteTransaction
        3.
          IInventoryOperationDescription
          IRouteTransactionOperation
        4.
          IRouteTransactionOperationDescription

  2. By type of action:
    Actions are organized from the most important to the least importante
    1. Insert
    2. Update
    3. Delete

  3. By time
    Basically a fifo mechanism (First in - First out)
*/

export function calculateSyncPriority(syncItem:ISyncRecord):number {
  const {action, payload, timestamp } = syncItem;
  const actionWeight = {'INSERT': 1, 'UPDATE': 2, 'DELETE': 3};

  return determiningWeightDependingOnRecordType(payload) * 100 + actionWeight[action] * 10 + Number(timestamp);
}
