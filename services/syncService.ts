import { IDay, IDayGeneralInformation, IInventoryOperation, IInventoryOperationDescription, IResponse, IRoute, IRouteDay, IRouteTransaction, IRouteTransactionOperation, IRouteTransactionOperationDescription } from '../interfaces/interfaces';
import {
  getAllInventoryOperations,
  getAllInventoryOperationDescription,
  getAllRouteTransactions,
  getAllRouteTransactionsOperations,
  getAllRouteTransactionsOperationDescriptions,
 } from '../queries/SQLite/sqlLiteQueries';

import { RepositoryFactory } from '../queries/repositories/RepositoryFactory';
import { IRepository } from '../queries/repositories/interfaces/IRepository';

import store from '../redux/store';
import { apiResponseStatus, createApiResponse, getDataFromApiResponse } from '../utils/apiResponse';
import { convertingArrayInDictionary } from '../utils/generalFunctions';

// Import guards
import {
  isTypeIInventoryOperation,
  isTypeIInventoryOperationDescription,
  isTypeIRouteTransaction,
  isTypeIRouteTransactionOperation,
  isTypeIRouteTransactionOperationDescription,
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
  This function is to sycing the central database with the local database.
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
    let recordsToSyncing:any[] = [];

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
   recordsToSyncing = recordsToSyncing.concat(
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

async function syncingRecordWithCentralDatabase() {
  const reduxState:any[] = [];
  const totalRecords:number = reduxState.length;

  const recordsToSync:any[] = reduxState.map(element => {return element;});
  const pendingRecordsToSync:any[] = [];

  /* Since it is a relational database, the process of syncing the records has
  priotization, so it is needed to identify the type of records and sort them
  before syncing with the database. */

  /*
  Order between records (interfaces)
  1.
    IInventoryOperation
    IRouteTransaction
  2.
    IInventoryOperationDescription
    IRouteTransactionOperation
  3.
    IRouteTransactionOperationDescription
  */

  try {
    // Sorting elements by internfaces
    recordsToSync.sort((a:any, b:any) => {
      let AisFirstLevel:number = Number(isTypeIInventoryOperation(a) || isTypeIRouteTransaction(a));
      let AisSecondLevel:number = Number(isTypeIInventoryOperationDescription(a)
                                || isTypeIRouteTransactionOperation(a));
      let AisThirdLevel:number = Number(isTypeIRouteTransactionOperationDescription(a));

      let BisFirstLevel:number = Number(isTypeIInventoryOperation(b) || isTypeIRouteTransaction(b));
      let BisSecondLevel:number = Number(isTypeIInventoryOperationDescription(b)
                                || isTypeIRouteTransactionOperation(b));
      let BisThirdLevel:number = Number(isTypeIRouteTransactionOperationDescription(a));

      let ACardinality:number = (AisFirstLevel * 1) + (AisSecondLevel * 2) + AisThirdLevel * 3;
      let BCardinality:number = (BisFirstLevel * 1) + (BisSecondLevel * 2) + BisThirdLevel * 3;

      if(ACardinality < BCardinality) {
        return -1;
      }

      if (ACardinality > BCardinality) {
        return 1;
      }

      return 0;
    });

    // Trying to insert with the main database.
    for (let i = 0; i < totalRecords; i++) {
      const record:any = reduxState[i];
      let response:IResponse<null>;
      if (isTypeIInventoryOperation(record)) {
        response = await repository.insertInventoryOperation(record);
      } else if (isTypeIInventoryOperationDescription(record)) {
        response = await repository.insertInventoryOperationDescription([ record ]);
      } else if (isTypeIRouteTransaction(record)) {
        response = await repository.insertRouteTransaction(record);
      } else if (isTypeIRouteTransactionOperation(record)) {
        response = await repository.insertRouteTransactionOperation(record);
      } else if (isTypeIRouteTransactionOperationDescription(record)) {
        response = await repository.insertRouteTransactionOperationDescription([ record ]);
      } else {
        /* The record is not recognized. */
        response = createApiResponse(500, null, null, null);
      }

      // Determinig if the record was syncing successfully.
      if(apiResponseStatus(response, 201)) {
        /* The record was inserted successfully. */
      } else {
        /* Something was wrong during insertion, so the current record is inserted into the pending
        records to sync. */
        pendingRecordsToSync.push(record);
      }
    }
  } catch (error) {
    /* Something was wrong during execution. */
  }
}

export {
  determingRecordsToBeSyncronized,
  syncingRecordWithCentralDatabase,
};
