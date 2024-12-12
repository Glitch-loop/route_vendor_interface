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
  let resultOfSyncProcess:boolean = false;
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
          table: record.table,
          action: record.action,
        };
      });

      /* Since it is a relational database, the process of syncing the records has
      priotization, so it is needed to identify the type of records and sort them
      (according with their prioritization) before syncing with the database.

      Order between records (interfaces):
      1. Work day
      2.
        IInventoryOperation
        IRouteTransaction
      3.
        IInventoryOperationDescription
        IRouteTransactionOperation
      4.
        IRouteTransactionOperationDescription
      */
      // Sorting elements by internfaces (descending order)
      syncQueue.sort((recordA:ISyncRecord, recordB:ISyncRecord) => {
        const a:any = recordA.payload;
        const b:any = recordB.payload;

        let AisFirstLevel:number = Number(isTypeWorkDayInstersection(a));
        let AisSecondLevel:number = Number(isTypeIInventoryOperation(a) || isTypeIRouteTransaction(a));
        let AisThirdLevel:number = Number(isTypeIInventoryOperationDescription(a)
        || isTypeIRouteTransactionOperation(a));
        let AisFourthLevel:number = Number(isTypeIRouteTransactionOperationDescription(a));

        let BisFirstLevel:number = Number(isTypeWorkDayInstersection(b));
        let BisSecondLevel:number = Number(isTypeIInventoryOperation(b) || isTypeIRouteTransaction(b));
        let BisThirdLevel:number = Number(isTypeIInventoryOperationDescription(b)
        || isTypeIRouteTransactionOperation(b));
        let BisFourthLevel:number = Number(isTypeIRouteTransactionOperationDescription(b));



        let ACardinality:number = (AisFirstLevel * 1) + (AisSecondLevel * 2) + (AisThirdLevel * 3) + (AisFourthLevel * 4);

        let BCardinality:number = (BisFirstLevel * 1) + (BisSecondLevel * 2) + (BisThirdLevel * 3) + (BisFourthLevel * 4);

        if(ACardinality > BCardinality) {
          return -1;
        }

        if (ACardinality < BCardinality) {
          return 1;
        }

        return 0;
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
            if (currentAction === 'INSERT') {
              response = await repository.insertInventoryOperation(currentRecord);
            } else if (currentAction === 'UPDATE') {
              response = await repository.updateInventoryOperation(currentRecord);
              // TODO
            } else {
              /* Other operation*/
            }
          } else if (isTypeIInventoryOperationDescription(currentRecord)) {
            if (currentAction === 'INSERT') {
              response = await repository.insertInventoryOperationDescription([ currentRecord ]);
            } else if (currentAction === 'UPDATE') {
              // TODO
            } else {
              /* Other operation*/
            }
          } else if (isTypeIRouteTransaction(currentRecord)) {
            if (currentAction === 'INSERT') {
              response = await repository.insertRouteTransaction(currentRecord);
            } else if (currentAction === 'UPDATE') {
              response = await repository.updateRouteTransaction(currentRecord);
            } else {
              /* Other operation*/
            }
          } else if (isTypeIRouteTransactionOperation(currentRecord)) {
            if (currentAction === 'INSERT') {
              response = await repository.insertRouteTransactionOperation(currentRecord);
            } else if (currentAction === 'UPDATE') {
              // TODO
            } else {
              /* Other operation*/
            }
          } else if (isTypeIRouteTransactionOperationDescription(currentRecord)) {
            if (currentAction === 'INSERT') {
              response = await repository.insertRouteTransactionOperationDescription([ currentRecord ]);
            } else if (currentAction === 'UPDATE') {
              // TODO
            } else {
              /* Other operation*/
            }
          } else if (isTypeWorkDayInstersection(currentRecord)) {
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

        // Determinig if the record was syncing successfully.
        if(apiResponseStatus(response, 201)) {
          /* The records was successfully synczed; It is not needed to store in the syncing queue
            table */
          if (currentRecordToSync === undefined) {
            /* For some reason it was stored a undefined element*/
          } else {
            recordsCorrectlyProcessed.push({
              id_record: currentRecordToSync.id_record,
              status: 'SUCCESS',
              payload: JSON.parse(currentRecordToSync.payload),
              table: currentRecordToSync.table,
              action: currentRecordToSync.action,
            });
          }
        } else {
          /* Something was wrong during insertion; There is not extra instructions for the record. */
        }
      }

      // Updating local database according with the result of the synchronizations
      await insertSyncHistoricRecords(recordsCorrectlyProcessed);
      await deleteSyncQueueRecords(recordsCorrectlyProcessed);

      if (recordsCorrectlyProcessed.length === syncQueue.length) {
        /* If The records correctly processed are equal to the number of records in the sync queue
        then it means that all the pending process where synchronized successfully. */
        resultOfSyncProcess = true;
      } else {
        /* For some reasone there were records that were not capable to be synchronized. */
        resultOfSyncProcess = false;
      }

    } else {
      /* Something was wrong during records retrieving; There is no extra instructions*/
      resultOfSyncProcess = false;
    }

    return resultOfSyncProcess;
  } catch (error) {
    /* Something was wrong during syncing process. */
    resultOfSyncProcess = false;
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

  BackgroundFetch.start()
}

export {
  determingRecordsToBeSyncronized,
  syncingRecordsWithCentralDatabase,
  createBackgroundSyncProcess,
};
