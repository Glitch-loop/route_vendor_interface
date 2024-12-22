// Libraries
import store from '../redux/store';
import BackgroundFetch from 'react-native-background-fetch';

// Interfaces
import { IDay, IDayGeneralInformation, IInventoryOperation, IInventoryOperationDescription, IResponse, IRoute, IRouteDay, IRouteTransaction, IRouteTransactionOperation, IRouteTransactionOperationDescription, ISyncRecord } from '../interfaces/interfaces';

// SQL queries
import {
  getAllInventoryOperations,
  getAllInventoryOperationDescription,
  getAllRouteTransactions,
  getAllRouteTransactionsOperations,
  getAllRouteTransactionsOperationDescriptions,
  insertSyncQueueRecord,
  insertSyncQueueRecords,
  deleteSyncQueueRecords,
  deleteAllSyncQueueRecords,
  getAllSyncQueueRecords,
  insertSyncHistoricRecord,
  insertSyncHistoricRecords,
  deleteSyncHistoricRecordById,
  getAllSyncHistoricRecords,
  updateSyncQueueRecords,
  deleteSyncQueueRecord,

 } from '../queries/SQLite/sqlLiteQueries';

import { RepositoryFactory } from '../queries/repositories/RepositoryFactory';
import { IRepository } from '../queries/repositories/interfaces/IRepository';

// Utils
import { apiResponseStatus, createApiResponse, getDataFromApiResponse } from '../utils/apiResponse';
import { convertingArrayInDictionary } from '../utils/generalFunctions';

// Import guards
import {
  isTypeIInventoryOperation,
  isTypeIInventoryOperationDescription,
  isTypeIRouteTransaction,
  isTypeIRouteTransactionOperation,
  isTypeIRouteTransactionOperationDescription,
  isTypeWorkDayInstersection,
} from '../utils/guards';
import {
  calculateSyncPriority,
  createSyncItem,
  createSyncItems,
} from '../utils/syncFunctions';


const repository:IRepository = RepositoryFactory.createRepository('supabase');

function setLeftOperation(setArray:any[], universeDictionary:any, itemKey:string) {
  const dictionaryToOperation = { ...universeDictionary };

  for (let i = 0; i < setArray.length; i++) {
    const key = setArray[i][itemKey];
    if(dictionaryToOperation[key] === undefined) {
      /* That means that the item is in the main database, but it isn't in the local database;
      there is not instructions */
    } else {
      /* The current record is already in the databae*/
      delete dictionaryToOperation[key];
    }
  }

  return dictionaryToOperation;
}

/*
  Function that deterimnes missing records in the main database.
*/
async function determingRecordsToBeSyncronized() {
  try {
    const reduxState = store.getState();
    const routeDay:IRoute&IDayGeneralInformation&IDay&IRouteDay = reduxState.routeDay;

    // Variables used to store information related to central database.
    let registeredInventoryOperations:IInventoryOperation[] = [];
    let registeredInventoryOperationsDescriptions:IInventoryOperationDescription[] = [];

    let registeredRouteTransactions:IRouteTransaction[] = [];
    let registeredRouteTransactionOperations:IRouteTransactionOperation[] = [];
    let registeredRouteTransactionOperationDescriptions:IRouteTransactionOperationDescription[] = [];

    // Variables used to store information related to the local database
    let localRegisteredInventoryOperations:any = {};
    let localRegisteredInventoryOperationsDescriptions:any = {};

    let localRegisteredRouteTransactions:any = {};
    let localRegisteredRouteTransactionOperations:any = {};
    let localRegisteredRouteTransactionOperationDescriptions:any = {};

    // Variable to concatenate all the records to synchronize
    let syncQueue:any[] = [];

    /* Extracting information from central database */
    /* Inventory operations */
    // Consulting all inventory operations of the day from main database
    const resultInventoryOperation:IResponse<IInventoryOperation[]>
      = await repository.getAllInventoryOperationsOfWorkDay(routeDay);

    registeredInventoryOperations = getDataFromApiResponse(resultInventoryOperation);

    // Consulting all inventory operation descriptions of the day from main database
    for (let i = 0; i < registeredInventoryOperations.length; i++) {
      let currentInventoryOperationDescriptions:IInventoryOperationDescription[] = [];

      // Getting the current descriptions of the inventory operation
      const resultInvetoryOperationDescriptions:IResponse<IInventoryOperationDescription[]>
        = await repository
        .getAllInventoryOperationDescriptionsOfInventoryOperation(registeredInventoryOperations[i]);

        currentInventoryOperationDescriptions
        = getDataFromApiResponse(resultInvetoryOperationDescriptions);

      // Appending the operation descriptions to the rest of operation descriptions
      registeredInventoryOperationsDescriptions = registeredInventoryOperationsDescriptions
      .concat(currentInventoryOperationDescriptions);
    }

    /* Route transaction */
    // Getting all route transactions of the day
    const resultRouteTransaction:IResponse<IRouteTransaction[]>
      = await repository.getAllRouteTransactionsOfWorkDay(routeDay);

      registeredRouteTransactions = getDataFromApiResponse(resultRouteTransaction);


    // Getting all route transaction operations of the day
    for (let i = 0; i < registeredRouteTransactions.length; i++) {
      let currentRouteTransactionOperation:IRouteTransactionOperation[] = [];

      const resultRouteTransactionOperation:IResponse<IRouteTransactionOperation[]>
        = await repository
        .getAllRouteTransactionOperationsOfRouteTransaction(registeredRouteTransactions[i]);

      currentRouteTransactionOperation = getDataFromApiResponse(resultRouteTransactionOperation);

      registeredRouteTransactionOperations = registeredRouteTransactionOperations
        .concat(currentRouteTransactionOperation);
    }

    // Getting all route transaction operations descriptions of the day
    for (let i = 0; i < registeredRouteTransactionOperations.length; i++) {
      let currentRouteTransactionOperationDescription:IRouteTransactionOperationDescription[] = [];

      const resultRouteTransactionOperationDescription
      :IResponse<IRouteTransactionOperationDescription[]> = await repository
        .getAllRouteTransactionOperationsDescriptionOfRouteTransactionOperation(registeredRouteTransactionOperations[i]);

        currentRouteTransactionOperationDescription = getDataFromApiResponse(resultRouteTransactionOperationDescription);

        registeredRouteTransactionOperationDescriptions
          = registeredRouteTransactionOperationDescriptions
            .concat(currentRouteTransactionOperationDescription);
    }

    /*Extracting information from local database*/
    const resultAllInventoryOperations:IResponse<IInventoryOperation[]>
      = await getAllInventoryOperations();

    /* Inventory operations */
    localRegisteredInventoryOperations = convertingArrayInDictionary(getDataFromApiResponse(resultAllInventoryOperations), 'id_inventory_operation');

    const resultAllInventoryOperationsDescriptions:IResponse<IInventoryOperationDescription[]>
    = await getAllInventoryOperationDescription();

    localRegisteredInventoryOperationsDescriptions = convertingArrayInDictionary(getDataFromApiResponse(resultAllInventoryOperationsDescriptions),
    'id_product_operation_description');

    /* Route transactions */
    const resultAllRouteTransactions:IResponse<IRouteTransaction[]>
      = await getAllRouteTransactions();

    localRegisteredRouteTransactions
      = convertingArrayInDictionary(getDataFromApiResponse(resultAllRouteTransactions),
      'id_route_transaction');

    const resultAllRouteTransactionOperations:IResponse<IRouteTransactionOperation[]>
    = await getAllRouteTransactionsOperations();

    localRegisteredRouteTransactionOperations
    = convertingArrayInDictionary(getDataFromApiResponse(resultAllRouteTransactionOperations),
    'id_route_transaction_operation');

    const resultAllRouteTransactionOperationDescriptions
    :IResponse<IRouteTransactionOperationDescription[]>
      = await getAllRouteTransactionsOperationDescriptions();

    localRegisteredRouteTransactionOperationDescriptions
    = convertingArrayInDictionary(
      getDataFromApiResponse(resultAllRouteTransactionOperationDescriptions),
      'id_route_transaction_operation_description');

    /* Determining records to be synchronizing with the central databae */
    /*
      Methodology to determine if a record needs synchronization:

      We have:
        - Arrays of the records that are already in the database from today.
        - Dictionaries of the records that are in the local database.

      The process will traverse all the arrays, each item will be searched in the dictionaries,
      if there is a match, that item of the dictionary will be deleted (because it is in the central
      database). At the end of the loop, we will have all remaining records that needs to be synchronized.
    */
   syncQueue = syncQueue.concat(
      /* Inventory operations */
      setLeftOperation(registeredInventoryOperations,
         localRegisteredInventoryOperations,
        'id_inventory_operation'),
      setLeftOperation(registeredInventoryOperationsDescriptions,
        localRegisteredInventoryOperationsDescriptions,
        'id_product_operation_description'),

        /* Route transactions */
      setLeftOperation(registeredRouteTransactions,
        localRegisteredRouteTransactions,
        'id_route_transaction'),
      setLeftOperation(registeredRouteTransactionOperations,
        localRegisteredRouteTransactionOperations,
        'id_route_transaction_operation'),
      setLeftOperation(registeredRouteTransactionOperationDescriptions,
        localRegisteredRouteTransactionOperationDescriptions,
        'id_route_transaction_operation_description')
    );

    // Saving in redux state to start synchronization.

  } catch (error) {
    /* Something was wrong during execution. */
  }
}

/* Function to sync records with the main database. */
async function syncingRecordsWithCentralDatabase():Promise<boolean> {
  const recordsCorrectlyProcessed:ISyncRecord[] = [];
  const recordsWronglyProcessed:ISyncRecord[] = [];
  let resultOfSyncProcess:boolean = false;
  console.log("sincronizando")
  try {
    const responseSynRecords:IResponse<ISyncRecord[]>
      = await getAllSyncQueueRecords();

      if (apiResponseStatus(responseSynRecords, 200)) {
        const syncQueue:ISyncRecord[] = getDataFromApiResponse(responseSynRecords)
      .map((record:ISyncRecord) => {
        return {
          id_record: record.id_record,
          status: record.status,
          payload: JSON.parse(record.payload),
          table_name: record.table_name,
          action: record.action,
          timestamp: record.timestamp,
        };
      });
      /*
        Since it is a relational database, the process of syncing the records has
        priotization, so it is needed to identify the type of records and sort them
        (according with their prioritization) before syncing with the database.

        Prioritization is given by "calculateSyncPriority" function. The function
        takes account 3 factors (type of record, type of action and time when was
        inserted).

        Note: At moment of design the sync mechanism the prioritization has
        an ascending order (being "1" the most important).
        In this way, if in a future it is needed to add new type of records or
        type of action it has just to be appended at the end of the list of
        prioritization (in its respective factor).
        So, at in the sorting function the "smallest number" will mean that is
        most important and therefore it has to be synced first.
      */
      // Sorting elements by internfaces (descending order)
      syncQueue.sort((recordA:ISyncRecord, recordB:ISyncRecord) => {
        const a:number = calculateSyncPriority(recordA);
        const b:number = calculateSyncPriority(recordB);
        if(a > b) {
          return 1;
        } else if (a < b) {
          return -1;
        } else {
          return 0;
        }
      });

      // Trying to synchronize records with main database.
      for(let i = 0; i < syncQueue.length; i++) {
        let response:IResponse<null> = createApiResponse(500, null, null, null);
        const currentRecordToSync:ISyncRecord|undefined = syncQueue[i];
        if (currentRecordToSync === undefined) {
          /* There is not instructions */
          response = createApiResponse(500, null, null, null);
        } else {
          const currentRecord:any = currentRecordToSync.payload;
          const currentAction:any = currentRecordToSync.action;
          if (isTypeIInventoryOperation(currentRecord)) {
            console.log("Type of record: inventory operation - ", currentRecord.id_inventory_operation)
            if (currentAction === 'INSERT') {
              response = await repository.insertInventoryOperation(currentRecord);
            } else if (currentAction === 'UPDATE') {
              response = await repository.updateInventoryOperation(currentRecord);
              // TODO
            } else {
              /* Other operation*/
            }
          } else if (isTypeIInventoryOperationDescription(currentRecord)) {
            console.log("Type of record: inventory operation description")
            if (currentAction === 'INSERT') {
              response = await repository.insertInventoryOperationDescription([ currentRecord ]);
            } else if (currentAction === 'UPDATE') {
              // TODO
            } else {
              /* Other operation*/
            }
          } else if (isTypeIRouteTransaction(currentRecord)) {
            console.log("Type of record: route transaction")
            if (currentAction === 'INSERT') {
              response = await repository.insertRouteTransaction(currentRecord);
            } else if (currentAction === 'UPDATE') {
              response = await repository.updateRouteTransaction(currentRecord);
            } else {
              /* Other operation*/
            }
          } else if (isTypeIRouteTransactionOperation(currentRecord)) {
            console.log("Type of record: route transaction operation")
            if (currentAction === 'INSERT') {
              response = await repository.insertRouteTransactionOperation(currentRecord);
            } else if (currentAction === 'UPDATE') {
              // TODO
            } else {
              /* Other operation*/
            }
          } else if (isTypeIRouteTransactionOperationDescription(currentRecord)) {
            console.log("Type of record: route transaction operation description")
            if (currentAction === 'INSERT') {
              response = await repository.insertRouteTransactionOperationDescription([ currentRecord ]);
            } else if (currentAction === 'UPDATE') {
              // TODO
            } else {
              /* Other operation*/
            }
          } else if (isTypeWorkDayInstersection(currentRecord)) {
            console.log("Type of record: general work day")
            if (currentAction === 'INSERT') {
              response = await repository.insertWorkDay(currentRecord);
            } else if (currentAction === 'UPDATE') {
              response = await repository.updateWorkDay(currentRecord);
            } else {
              /* Other operation*/
            }
          } else {
            /* The record is not recognized. */
            response = createApiResponse(500, null, null, null);
          }
        }

        console.log("this response: ", response)
        // Determinig if the record was syncing successfully.
        if(apiResponseStatus(response, 201) || apiResponseStatus(response, 200)) {
          console.log("the request was successfully processed")
          /* The records was successfully synczed; It is not needed to store in the syncing queue
            table */
          if (currentRecordToSync === undefined) {
            /* For some reason it was stored a undefined element*/
          } else {
            recordsCorrectlyProcessed.push({
              id_record: currentRecordToSync.id_record,
              status: 'SUCCESS',
              payload: JSON.stringify(currentRecordToSync.payload),
              table_name: currentRecordToSync.table_name,
              action: currentRecordToSync.action,
              timestamp: currentRecordToSync.timestamp,
            });
          }
        } else {
          /* Something was wrong during insertion. */
          if(apiResponseStatus(response, 409)) { // Conflict
            /*
              It is probably the record already exists in the central database.

              For this case, it is considered that was successfully synchronized.
            */
            recordsCorrectlyProcessed.push({
              id_record: currentRecordToSync.id_record,
              status: 'SUCCESS',
              payload: JSON.stringify(currentRecordToSync.payload),
              table_name: currentRecordToSync.table_name,
              action: currentRecordToSync.action,
              timestamp: currentRecordToSync.timestamp,
            });
          } else {
            /*
              It cannot be determinated why the record cannot be synced.

              If status is "PENDING" it is going to be changed to failed for one more 
              opportunity.

              Otherwise, it is going to change to failed to delete it from the queue.
            */
            if(currentRecordToSync.status === 'FAILED') {
              /*
                The records was already processed and twice.
                It is appended to "recordsCorrectlyProcessed" for being deleted and
                moved to the historic sync table.
              */
              recordsCorrectlyProcessed.push({
                id_record: currentRecordToSync.id_record,
                status: 'FAILED',
                payload: JSON.stringify(currentRecordToSync.payload),
                table_name: currentRecordToSync.table_name,
                action: currentRecordToSync.action,
                timestamp: currentRecordToSync.timestamp,
              });
            } else {
              /*
                Record couldn't be processed and is updated to "failed" for one more opportunity
              */
             console.log("second opportunity")
             recordsWronglyProcessed.push({
              id_record: currentRecordToSync.id_record,
              status: 'FAILED',
              payload: JSON.stringify(currentRecordToSync.payload),
              table_name: currentRecordToSync.table_name,
              action: currentRecordToSync.action,
              timestamp: currentRecordToSync.timestamp,
             });
            }
          }
        }
      }
      console.log("records to syncronize: ", syncQueue.length)
      console.log("Records correctly syncronized: ", recordsCorrectlyProcessed.length);
      // Updating records for an other opportunity
      await updateSyncQueueRecords(recordsWronglyProcessed);

      // Updating local database according with the result of the synchronizations
      await insertSyncHistoricRecords(recordsCorrectlyProcessed);
      await deleteSyncQueueRecords(recordsCorrectlyProcessed);

      if (recordsCorrectlyProcessed.length === syncQueue.length) {
        /* If The records correctly processed are equal to the number of records in the sync queue
        then it means that all the pending process where synchronized successfully. */
        console.log("Todo fue procesado correctamente")
        resultOfSyncProcess = true;
      } else {
        /* For some reasone there were records that were not capable to be synchronized. */
        console.log("Hubo datos sin procesar")
        resultOfSyncProcess = false;
      }

    } else {
      /* Something was wrong during records retrieving; There is no extra instructions*/
      console.log("Algo salio mal al momento de recuperar la informacion")
      resultOfSyncProcess = false;
    }
    console.log("resultado sincronizacion: ", resultOfSyncProcess)
    return resultOfSyncProcess;
  } catch (error) {
    /* Something was wrong during syncing process. */
    resultOfSyncProcess = false;
    console.log("error durante sincronizacion: ", error)
    return resultOfSyncProcess;
  }
}

async function createBackgroundSyncProcess() {
  BackgroundFetch.configure({
    minimumFetchInterval: 15, // Execute every 15 minutes (minimum for iOS)
    stopOnTerminate: false,   // Continue running even after the app is terminated
    startOnBoot: true,        // Automatically restart on device reboot
    enableHeadless: true,     // Allow execution in headless mode (no UI)
    requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
  },
  async (taskId:string) => {
    await syncingRecordsWithCentralDatabase();
    BackgroundFetch.finish(taskId);
  },
  (error) => {
    console.error('[BackgroundFetch] Failed to configure:', error);
  });

  BackgroundFetch.start();
}

export async function createRecordForSyncingWithCentralDatabse(
  data:any,
  status:'PENDING'|'SUCCESS'|'FAILED',
  action:'INSERT'|'UPDATE'|'DELETE'
):Promise<IResponse<any>> {

  const recordToSync:ISyncRecord = createSyncItem(data, status, action);

  const resultInsertSyncRecord:IResponse<any> = await insertSyncQueueRecord(recordToSync);

  if(apiResponseStatus(resultInsertSyncRecord, 201)) {
    /* This is not instructions */
  } else {
    resultInsertSyncRecord.responseCode = 400;
      await deleteSyncQueueRecord(recordToSync);
  }

  resultInsertSyncRecord.data = recordToSync;

  return resultInsertSyncRecord;
}

export async function deleteRecordForSyncingWithCentralDatabase(
  data:any,
  status:'PENDING'|'SUCCESS'|'FAILED',
  action:'INSERT'|'UPDATE'|'DELETE'
) {
  const resultDeleteSyncRecord:IResponse<null> =
    await deleteSyncQueueRecord(createSyncItem(data, status, action));

  return resultDeleteSyncRecord;
}

export async function createRecordsForSyncingWithCentralDatabse(
  data:any[],
  status:'PENDING'|'SUCCESS'|'FAILED',
  action:'INSERT'|'UPDATE'|'DELETE'
):Promise<IResponse<any>> {

  const resultInsertSyncRecord:IResponse<ISyncRecord[]> =
    await insertSyncQueueRecords(createSyncItems(data, status, action));

  if(apiResponseStatus(resultInsertSyncRecord, 201)) {
    /* This is not instructions */
  } else {
    resultInsertSyncRecord.responseCode = 400;
    await deleteSyncQueueRecords(createSyncItems(data, status, action));
  }

  return resultInsertSyncRecord;
}

export async function deleteRecordsForSyncingWithCentralDatabase(
  data:any,
  status:'PENDING'|'SUCCESS'|'FAILED',
  action:'INSERT'|'UPDATE'|'DELETE'
) {
  const resultDeleteSyncRecord:IResponse<ISyncRecord[]>
    = await deleteSyncQueueRecords(createSyncItems(data, status, action));

  return resultDeleteSyncRecord;
}

export async function cleanAllRecordsToSyncFromDatabase() {
  const resultDeleteAllSyncRecords:IResponse<null> = await deleteAllSyncQueueRecords();

  return resultDeleteAllSyncRecords;
}

export {
  determingRecordsToBeSyncronized,
  syncingRecordsWithCentralDatabase,
  createBackgroundSyncProcess,
};
