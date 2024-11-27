// Libraries
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, BackHandler } from 'react-native';
import 'react-native-get-random-values'; // Necessary for uuid
import {v4 as uuidv4 } from 'uuid';
import tw from 'twrnc';

// Queries
// Main database
import { RepositoryFactory } from '../queries/repositories/RepositoryFactory';
// import {
//   getAllProducts,
//   getAllStoresInARouteDay,
//   getStoresByArrID,
// } from '../queries/queries';

// Embedded database
import {
  insertDayOperations,
  insertProducts,
  insertStores,
  insertWorkDay,
  insertDayOperation,
  insertInventoryOperation,
  insertInventoryOperationDescription,
  getInventoryOperation,
  getInventoryOperationDescription,
  getProducts,
  getAllInventoryOperations,
  getRouteTransactionByStore,
  getRouteTransactionOperations,
  getRouteTransactionOperationDescriptions,
  updateProducts,
  updateWorkDay,
  deleteAllDayOperations,
  deleteAllWorkDayInformation,
  deleteAllProducts,
  deleteAllStores,
  deleteAllInventoryOperations,
  deleteAllInventoryOperationsDescriptions,
  deleteAllRouteTransactions,
  deleteAllRouteTransactionOperations,
  deleteAllRouteTransactionOperationDescriptions,
  deleteInventoryOperationDescriptionsById,
  deleteInventoryOperationsById

} from '../queries/SQLite/sqlLiteQueries';

// Redux context
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { setDayGeneralInformation } from '../redux/slices/routeDaySlice';
import { addProductsInventory, setProductInventory } from '../redux/slices/productsInventorySlice';
import { setStores } from '../redux/slices/storesSlice';
import {
  setArrayDayOperations,
  setDayOperation,
  setDayOperationBeforeCurrentOperation,
  setNextOperation,
} from '../redux/slices/dayOperationsSlice';
import { setCurrentOperation } from '../redux/slices/currentOperationSlice';

// Components
import RouteHeader from '../components/RouteHeader';
import TableInventoryOperations from '../components/InventoryComponents/TableInventoryOperations';
import VendorConfirmation from '../components/VendorConfirmation';
import TableInventoryVisualization from '../components/InventoryComponents/TableInventoryVisualization';
import TableInventoryOperationsVisualization from '../components/InventoryComponents/TableInventoryOperationsVisualization';

// Interfaces
import {
  ICurrency,
  IProductInventory,
  IRouteDayStores,
  IStore,
  IDayGeneralInformation,
  IDay,
  IRouteDay,
  IRoute,
  IDayOperation,
  IInventoryOperation,
  IInventoryOperationDescription,
  IStoreStatusDay,
  IRouteTransaction,
  IRouteTransactionOperation,
  IResponse,
  IProduct,
 } from '../interfaces/interfaces';

// Utils
import DAYS_OPERATIONS from '../lib/day_operations';
import TableCashReception from '../components/InventoryComponents/TableCashReception';
import { timestamp_format } from '../utils/momentFormat';
import { planningRouteDayOperations } from '../utils/routesFunctions';
import { determineRouteDayState } from '../utils/routeDayStoreStatesAutomata';
import { enumStoreStates } from '../interfaces/enumStoreStates';
import { initialMXNCurrencyState } from '../utils/inventoryOperations';
import { addingInformationParticularFieldOfObject, convertingDictionaryInArray } from '../utils/generalFunctions';
import {
  apiResponseProcess,
  apiResponseStatus,
  getDataFromApiResponse,
} from '../utils/apiResponse';
import Toast from 'react-native-toast-message';

// Initializing database
const databaseRepository = RepositoryFactory.createRepository('supabase');

const {
  getAllProducts,
  getAllStoresInARouteDay,
  getStoresByArrID,
} = databaseRepository;

const initialProduct:IProductInventory = {
  id_product: '',
  product_name: '',
  barcode: '',
  weight: '',
  unit: '',
  comission: 0,
  price: 0,
  product_status: 0,
  order_to_show: 0,
  amount: 0,
};

function getTitleOfInventoryOperation(dayOperation: IDayOperation):string {
  let title:string = 'Inventario';

  if (dayOperation.id_type_operation === DAYS_OPERATIONS.start_shift_inventory) {
    title = 'Inventario inicial';
  } else if(dayOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory) {
    title = 'Re-sctok de inventario';
  } else if(dayOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory) {
    title = 'Inventario final';
  } else if(dayOperation.id_type_operation === DAYS_OPERATIONS.product_devolution_inventory) {
    title = 'Devolución de producto';
  } else {
    /* There is not instructions */
  }

  return title;
}

function creatingNewWorkDay(cashInventory:ICurrency[],
  routeDay:IRoute&IDayGeneralInformation&IDay&IRouteDay):IRoute&IDayGeneralInformation&IDay&IRouteDay {
  const workDay:IRoute&IDayGeneralInformation&IDay&IRouteDay = {
    /*Fields related to the general information.*/
    id_work_day: '',
    start_date: '',
    finish_date: '',
    start_petty_cash: 0,
    final_petty_cash: 0,
    /*Fields related to IRoute interface*/
    id_route: '',
    route_name: '',
    description: '',
    route_status: '',
    id_vendor: '',
    /*Fields related to IDay interface*/
    id_day: '',
    day_name: '',
    order_to_show: 0,
    /*Fields relate to IRouteDay*/
    id_route_day: '',
  };

  try {
    const updatedRouteDay:IRoute&IDayGeneralInformation&IDay&IRouteDay = { ...routeDay };

    let startPettyCash:number = cashInventory.reduce((acc, currentCurrency) =>
      { if (currentCurrency.amount === undefined) {return acc;} else {return acc + currentCurrency.amount * currentCurrency.value;}}, 0);

    // General information about the route.
    updatedRouteDay.id_work_day = uuidv4();
    updatedRouteDay.start_date = timestamp_format();
    updatedRouteDay.finish_date = timestamp_format();
    updatedRouteDay.start_petty_cash = startPettyCash;
    updatedRouteDay.final_petty_cash =  0;

    // Concatenating all the information.
    return updatedRouteDay;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Error durante la creación del nuevo dia de trabajo.',
      text2: 'Ha habido un error durante la creación del dia de trabajo, por favor intente nuevamente.',
    });
    return workDay;
  }
}

function finishingWorkDay(cashInventory:ICurrency[],
  routeDay:IRoute&IDayGeneralInformation&IDay&IRouteDay):IRoute&IDayGeneralInformation&IDay&IRouteDay {
  try {
    const updatedRouteDay:IRoute&IDayGeneralInformation&IDay&IRouteDay = { ...routeDay };

    let endPettyCash:number = cashInventory.reduce((acc, currentCurrency) =>
      { if (currentCurrency.amount === undefined) {return acc;} else {return acc + currentCurrency.amount * currentCurrency.value;}}, 0);

    // General information about the route.
    /* Since it is the end shift of the route, there are information that we already have from other operations */
    updatedRouteDay.finish_date = timestamp_format();
    updatedRouteDay.final_petty_cash = endPettyCash;

    return updatedRouteDay;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Error durante cierre del dia de trabajo.',
      text2: 'Ha habido error durante la finalización del "dia de trabajo", intente nuevamente.',
    });
    return routeDay;
  }
}

async function gettingStoresInformation(storesInRoute:IRouteDayStores[]):
Promise<IResponse<(IStore&IStoreStatusDay)[]>> {
  let resultGetStores:IResponse<any> = {
    responseCode: 500,
    data: [],
  };

  try {
    const stores:(IStore&IStoreStatusDay)[] = [];
    let storesInformation:IStore[] = [];
    const idStoresArr:string[] = [];

    // Getting the information of the stores.

    /*
      In addition of the information of the stores, it is determined the "state" for each store during the route.

      The state is a way to determine the status of a store in route (if it is pending to visit, if it has been visited,
      if it is a new client, etc).
    */
    for (let i = 0; i < storesInRoute.length; i++) {
      const { id_store } = storesInRoute[i];
      idStoresArr.push(id_store);
    }

    resultGetStores = await getStoresByArrID(idStoresArr);

    if(apiResponseStatus(resultGetStores, 200)) {
      storesInformation = getDataFromApiResponse(resultGetStores);

      // Assign the status for each store in the route.
      storesInformation.map((storeInformation) => {
        stores.push({
          ...storeInformation,
          route_day_state: determineRouteDayState(enumStoreStates.NUETRAL_STATE, 1),
        });
      });

      // Storing the complete information in the response.
      resultGetStores.data = stores;

    } else {
      Toast.show({
        type: 'error',
        text1:'Error durante la consulta de las tiendas en la ruta.',
        text2: 'Ha habido un error durante la consulta de las tiendas para crear el inventario, por favor intente nuevamente',
      });
    }

    return resultGetStores;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1:'Error durante la consulta las tiendas en la ruta',
      text2: 'Ha habido un error durante la consulta de las tiendas para crear el inventario, por favor intente nuevamente',
    });

    resultGetStores.responseCode = 500;
    resultGetStores.data = [];

    return resultGetStores;
  }
}

async function gettingRouteInformationOfTheStores(routeDay:IRouteDay)
:Promise<IResponse<IRouteDayStores[]>> {
  let resultAllStoresInRoute:IResponse<IRouteDayStores[]> = {
    responseCode: 500,
    data: [],
  };
  try {
    const storesInTheRoute:IRouteDayStores[] = [];
    /*
      Getting the particular stores that belongs to the route day.
      In addition, this query provides the position of each store in the day.
    */
    // Getting the stores that belongs to this particular day of the route
    resultAllStoresInRoute = await getAllStoresInARouteDay(routeDay.id_route_day);

    if (apiResponseStatus(resultAllStoresInRoute, 200)) {
      let allStoreInRoute:IRouteDayStores[] = getDataFromApiResponse(resultAllStoresInRoute);

      allStoreInRoute.forEach((storeInRouteDay) => { storesInTheRoute.push(storeInRouteDay); });

      resultAllStoresInRoute.data = storesInTheRoute;

    } else {

      Toast.show({type: 'error',
        text1:'Error durante la consulta de la información de las tiendas para crear el inventario', text2: 'Ha habido un error durante la consulta de la información de las tiendas, por favor intente nuevamente',
      });
    }

    return resultAllStoresInRoute;

  } catch (error) {
    resultAllStoresInRoute.responseCode = 500;
    resultAllStoresInRoute.data = [];

    Toast.show({type: 'error',
      text1:'Error durante la consulta de la información de las tiendas para crear el inventario', text2: 'Ha habido un error durante la consulta de la información de las tiendas, por favor intente nuevamente',
    });
    return resultAllStoresInRoute;
  }
}

function creatingInventoryOperation(dayGeneralInformation:IDayGeneralInformation, idTypeOperation:string):IInventoryOperation {
  const inventoryOperation:IInventoryOperation = {
    id_inventory_operation: '',
    sign_confirmation: '',
    date: '',
    audit: 0,
    id_type_of_operation: '',
    id_work_day: '',
  };
  try {
    if (idTypeOperation === '') {
      /* It is not possible to create a new inventory operation without the ID
      of the type operation*/
    } else {
      // Creating the inventory operation (this inventory operation is tied to the "work day").
      inventoryOperation.id_inventory_operation = uuidv4();
      inventoryOperation.sign_confirmation = '1';
      inventoryOperation.date = timestamp_format();
      inventoryOperation.audit = 0;
      inventoryOperation.id_type_of_operation = idTypeOperation;
      inventoryOperation.id_work_day = dayGeneralInformation.id_work_day;
    }

    return inventoryOperation;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Error durante la creación del inventario.',
      text2: 'Ha habido un error al momento de crear el inventario.',
    });
    return inventoryOperation;
  }
}

function creatingInventoryOperationDescription(inventory:IProductInventory[], inventoryOperation:IInventoryOperation):IInventoryOperationDescription[] {
  const inventoryOperationDescription:IInventoryOperationDescription[] = [];
  try {
    // Extracting information from the inventory operation.
    inventory.forEach(product => {
      inventoryOperationDescription.push({
        id_product_operation_description: uuidv4(),
        price_at_moment: product.price,
        amount: product.amount,
        id_inventory_operation: inventoryOperation.id_inventory_operation,
        id_product: product.id_product,
      });
    });
    return inventoryOperationDescription;
  } catch (error) {
    return inventoryOperationDescription;
  }
}

function creatingDayOperation(idItem:string, idTypeOperation:string, operationOrder:number, currentOperation:number):IDayOperation {
  const dayOperation:IDayOperation = {
    id_day_operation: '',
    id_item: '', //At this point the inventory hasn't been created.
    id_type_operation: '',
    operation_order: 0,
    current_operation: 0,
  };
  try {
    // Creating a day operation (day operation resulted from the ivnentory operation).
    dayOperation.id_day_operation = uuidv4();
    dayOperation.id_item = idItem === '' ? uuidv4() : idItem;
    dayOperation.id_type_operation = idTypeOperation;
    dayOperation.operation_order = operationOrder;
    dayOperation.current_operation = currentOperation;

    return dayOperation;
  } catch (error) {
    return dayOperation;
  }
}

async function startShiftInventoryOperationProcess(
  cashInventory:ICurrency[],
  routeDay:IRoute&IDayGeneralInformation&IDay&IRouteDay,
  inventory:IProductInventory[],
  currentOperation: IDayOperation,
  dispatch: AppDispatch,
):Promise<boolean> {
  try {
    /*
      When the vendor clicks "accept", he accepts to perform the currnet day.
      So, before creating the first inventory of the day, it is needed to create the "work day".

      A "work day" is a coined concept to refer to all the "generla information" to identify
      the current day as a " work day".

      At this moment, all of these information is already recorded:
        - route: Information related to the route identification.
        - day: The information of the day.
        - routeDay: Information that relates the day to perform and the route.

      But it is needed to complete the remainded information:
        - General information related to the route.
    */

    Toast.show({
      type: 'info',
      text1: 'Comenzando registro de inventario inicial.',
      text2: 'Registrando inventario inicial y consultando información para la ruta.',
    });

    const dayGeneralInformation:IRoute&IDayGeneralInformation&IDay&IRouteDay
      = creatingNewWorkDay(cashInventory, routeDay);

    // Storing information in embedded database.
    const resultInsertionWorkDay:IResponse<IRoute&IDayGeneralInformation&IDay&IRouteDay>
      = await insertWorkDay(dayGeneralInformation);

    Toast.show({
      type: 'info',
      text1: 'Consultando tiendas de la ruta de hoy.',
      text2: 'Consultando tiendas que conforman la ruta de hoy.',
    });

    // Getting the stores that belongs to the route.
    const resultGetStoresInTheRoute:IResponse<IRouteDayStores[]>
    = await gettingRouteInformationOfTheStores(routeDay);

    const storesInTheRoute:IRouteDayStores[] = apiResponseProcess(resultGetStoresInTheRoute);

    // Gettin all the information of the stores that belongs to the route.
    const resultGetStoresOfRoute:IResponse<(IStore&IStoreStatusDay)[]>
      = await gettingStoresInformation(storesInTheRoute);

    const storesOfRoute:(IStore&IStoreStatusDay)[] = apiResponseProcess(resultGetStoresOfRoute);

    // Storing in embedded database
    const resultInsertionStores:IResponse<(IStore&IStoreStatusDay)[]>
      = await insertStores(storesOfRoute);

    /*
      After "selecting" the route, and therefore, creating the workday, it will be created the inventory operation that respresents the "start shift inventory" (to have product for selling).
    */
    Toast.show({
      type: 'info',
      text1: 'Registrando el inventario inicial.',
      text2: 'Registrando la información que compone el inventario inicial.',
    });

    const inventoryOperation:IInventoryOperation
      = creatingInventoryOperation(dayGeneralInformation, DAYS_OPERATIONS.start_shift_inventory);

    const inventoryOperationDescription:IInventoryOperationDescription[]
      = creatingInventoryOperationDescription(inventory, inventoryOperation);

    // Inventory operation.
    /* Due to this information is low read data, it is going to be stored only in the embedded database. */
    /* Related to the inventory operation */
    // Storing information in embedded database.
    const resultInventoryOperation:IResponse<IInventoryOperation>
      = await insertInventoryOperation(inventoryOperation);

    // Storing information in embedded database.
    const resultInventoryOperationDescription:IResponse<IInventoryOperationDescription[]>
      = await insertInventoryOperationDescription(inventoryOperationDescription);

    /* Related to the inventory that the vendor will use to sell */
    /* Related to the product information */
    // Storing information in embedded database.
    const resultInsertProducts:IResponse<IProductInventory[]> = await insertProducts(inventory);

    /*
      At this moment, it has been collected all the information needed for the work day,
      so it is needed to organize the operations that the vendor is going to do throughout the day a.k.a
      work day operations.
    */

    // Creating a work day operation for the "start shift inventory".
    const newDayOperation:IDayOperation
      = creatingDayOperation(inventoryOperation.id_inventory_operation, currentOperation.id_type_operation, 0, 1);

    const resultInsertDayOperation:IResponse<IDayOperation>
      = await insertDayOperation(newDayOperation);

    // Store information in embedded database.
    // Start shift inventory is not longer the current activity.
    newDayOperation.current_operation = 0;

    // Getting the rest of the day operations (the stores that are going to be visited)
    let dayOperationsOfStores:IDayOperation[] = planningRouteDayOperations(storesInTheRoute);

    // Storing in embedded database
    if (dayOperationsOfStores.length > 0) {
      // The first store of the route is now the new current operation.
      dayOperationsOfStores[0].current_operation = 1;
    }

    const resultInsertDayOperations:IResponse<IDayOperation[]>
      = await insertDayOperations(dayOperationsOfStores);

    /*
      At this point the records needed to start a database have been created.
      In the workflow of the application, the first operation has been completed (starting
      shift inventory), so it is needed to advance to the next operation (first store of
      the route).
    */

    if (apiResponseStatus(resultInsertionWorkDay, 201)
    && apiResponseProcess(resultInsertionStores, 201)
    && apiResponseProcess(resultInventoryOperation, 201)
    && apiResponseProcess(resultInventoryOperationDescription, 201)
    && apiResponseProcess(resultInsertProducts, 201)
    && apiResponseProcess(resultInsertDayOperation, 201)
    && apiResponseProcess(resultInsertDayOperations, 201)
    && apiResponseProcess(resultGetStoresInTheRoute, 200)
    && apiResponseProcess(resultGetStoresOfRoute, 200)) {
      /* The process has been finished successfully */
      /* Once the information has been stored in the embedded database, store the information
          in the states of the application.
      */
      // States affected in this operation.

      // General information of the day
      dispatch(setDayGeneralInformation(dayGeneralInformation));

      // Corner stores of the route.
      dispatch(setStores(storesOfRoute));

      // Product inventory of the workday.
      dispatch(setProductInventory(inventory));

      // Storing the list of activities
      // Storing the "start shift inventory"
      dispatch(setDayOperation(newDayOperation));

      // Storing the rest of day operations in array.
      dispatch(setArrayDayOperations(dayOperationsOfStores));

      // Setting as the new "current operation" the first store of the route.
      dispatch(setNextOperation());

      Toast.show({
        type: 'success',
        text1: 'Se ha registrado el inventario inicial con exito.',
        text2: 'El proceso para registrar el inventario inicial ha sido completado exitosamente.',
      });

      return true;
    } else {
      /* Something was wrong during the creation of the route day or
      during the registratio of the 'start shift inventory'. */
      /*
        It is not possible to start a new day if there is missing information.
        So, in case of error or failure, it is needed to delete or clena all the database
        and starting the 'start shift inventory' again.
      */
      Toast.show({
        type: 'error',
        text1: 'Ha habido un error durante el registro del inventario inicial.',
        text2: 'Ha sucedido un error durante el registro del inventario inicial, por favor intente nuevamente.',
      });
      // Deleting work day information.
      await deleteAllWorkDayInformation();

      // Deleting inventory.
      await deleteAllProducts();

      // Deleting stores of the route.
      await deleteAllStores();

      // Deleting all inventory operations.
      await deleteAllInventoryOperations();
      await deleteAllInventoryOperationsDescriptions();

      // Deleting all route transactions.
      await deleteAllRouteTransactions();
      await deleteAllRouteTransactionOperations();
      await deleteAllRouteTransactionOperationDescriptions();

      // Deleting all the day operations (the list of actions for the vendor)
      await deleteAllDayOperations();

      return false;
    }
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Ha habido un error durante el registro del inventario inicial.',
      text2: 'Ha sucedido un error durante el registro del inventario inicial, por favor intente nuevamente.',
    });
    // Deleting work day information.
    await deleteAllWorkDayInformation();

    // Deleting inventory.
    await deleteAllProducts();

    // Deleting stores of the route.
    await deleteAllStores();

    // Deleting all inventory operations.
    await deleteAllInventoryOperations();
    await deleteAllInventoryOperationsDescriptions();

    // Deleting all route transactions.
    await deleteAllRouteTransactions();
    await deleteAllRouteTransactionOperations();
    await deleteAllRouteTransactionOperationDescriptions();

    // Deleting all the day operations (the list of actions for the vendor)
    await deleteAllDayOperations();

    return false;
  }

}

async function intermediateInventoryOperationProcess(
  routeDay:IRoute&IDayGeneralInformation&IDay&IRouteDay,
  inventory:IProductInventory[],
  currentInventory:IProductInventory[],
  currentOperation: IDayOperation,
  dayOperations: IDayOperation[],
  dispatch: AppDispatch,
):Promise<boolean> {
  /*
    Analyzing the workflow of the operations both re-stock operation and product devolution
    share great part of the process, they only differ at the end of the process;
    re-stock operation goes back to the route operation menu and product devolution
    prepare a new inventory for doing the final inventory.
  */
  const { id_type_operation } = currentOperation;

  // Creating the inventory operation (this inventory operation is tied to the "work day").
  const inventoryOperation:IInventoryOperation
    = creatingInventoryOperation(routeDay,id_type_operation);

  // Creating the movements of the inventory operation (also know as operation description).
  const inventoryOperationDescription:IInventoryOperationDescription[]
    = creatingInventoryOperationDescription(inventory, inventoryOperation);

  try {
    Toast.show({
      type: 'info',
      text1: 'Comenzando registro de operación de inventario.',
      text2: 'Comenzado el registro de la operación de inventario.',
    });
    // Inserting in embedded database the new inventory operation.
    const resultInsertionInventoryOperation:IResponse<IInventoryOperation>
      = await insertInventoryOperation(inventoryOperation);

    // Inserting in embedded database the descriptions of the inventory operation
    const resultInsertionInventoryOperationDescription
    :IResponse<IInventoryOperationDescription[]>
      = await insertInventoryOperationDescription(inventoryOperationDescription);

    // Updating inventory with the current inventory operation (current amount of product + amount to carry).
    /*
      Note: Product inventory has 2 items to be updated:
      - The product itself .
      The operation itself (how many product the vendor is carrying or returning)
      - And the updated inventory, bascially the current product amount + inventory operation amount.
    */
    const newInventory:IProductInventory[] = [];

    currentInventory.forEach((currentInventoryUpdate) => {
      const productFound:undefined|IProductInventory = inventory
        .find(productInventory => productInventory.id_product === currentInventoryUpdate.id_product);
        if (productFound !== undefined) {
          newInventory.push({
            ...productFound,
            amount: currentInventoryUpdate.amount + productFound.amount,
          });
        }
    });

    // Updating the inventory in embedded database with the last changes.
    const resultUpdatingInventory:IResponse<IProductInventory[]> = await updateProducts(newInventory);

    // Updating list of day operations
    // Creating a work day operation for the "shift inventory operation".
    const newDayOperation:IDayOperation
      = creatingDayOperation(inventoryOperation.id_inventory_operation,
        currentOperation.id_type_operation, 0, 0);
    const newListDayOperations:IDayOperation[] = [];
    /*
      Once all the processes have been stored, the day operation itself is created.

      There are two options:
        1 - Instert the specific item at the middle of the list of the day operations.
        2 - Delete and instert all the day operations, keeping the current information. The difference in this scenario is that
        the new operation is placing in the next position of the current operation.
        Delete and instert all the day operations, respecting the current information, with the differente of
        place the new operation in the position that correspond.

      Although this strategy of deleting and insterting the list of all the day operations, it is considered as better than
      keep updating the information.
    */

    /* Getting the index of the current operation*/
    const index = dayOperations.findIndex(dayOperation => dayOperation.current_operation === 1);

    // Creating a copy of the list of the day operations.
    dayOperations.forEach(dayOperation => { newListDayOperations.push(dayOperation); });

    if (index === -1) { // Case on which the re-stock operation is the last operation in the day.
      newListDayOperations.push(newDayOperation);
    } else { // Case on which the re-stock operation is at the middle of the day (between other day operations).
      newListDayOperations.splice(index, 0, newDayOperation);
    }

    // Replacing the entire list of day operations in embedded datbase.
    // Delete all the information from the database.
    const resultDeletionAllDayOperations:IResponse<null> = await deleteAllDayOperations();

    // Store information in embedded database.
    const resultInsertionAllDayOperations:IResponse<IDayOperation[]> = await insertDayOperations(newListDayOperations);


    if (apiResponseProcess(resultInsertionInventoryOperation, 201)
    &&  apiResponseProcess(resultInsertionInventoryOperationDescription, 201)
    &&  apiResponseProcess(resultUpdatingInventory, 200)
    &&  apiResponseProcess(resultDeletionAllDayOperations, 200)
    &&  apiResponseProcess(resultInsertionAllDayOperations, 201)) {
      /* There was not an error during the process. */
      /* At this point, the inventory operation has been finished and registered. */

      // Updating redux states.
      // Updating the the inventory with the last changes.
      dispatch(addProductsInventory(inventory));

      // Store the information (new operation) in redux context.
      dispatch(setDayOperationBeforeCurrentOperation(newDayOperation));

      if (currentOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory) {
        /* There is not extra instructions. */
        Toast.show({
          type: 'success',
          text1: 'Se ha registrado el re-stock de producto exitosamente.',
          text2: 'Se ha agregado los productos del re-stock de producto al inventario.',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Se ha registrado la devolución de producto exitosamente.',
          text2: 'Se ha registrado el inventario de devolución de producto exitosamente.',
        });

        /* The inventory operation was an "product devolution inventoy" */
        // Creating a new work day operation for "end shift inventory".
        let nextDayOperation:IDayOperation
          = creatingDayOperation(inventoryOperation.id_inventory_operation, DAYS_OPERATIONS.end_shift_inventory, 0, 0);

        // Set the new day operation as the current one.
        dispatch(setCurrentOperation(nextDayOperation));
      }

      return true;
    } else {
      /* There was an error during the process. */
      Toast.show({
        type: 'error',
        text1: 'Ha habido un error durnate la operación de inventario.',
        text2: 'Ha habido un error durante el registro de la operación de inventario, porfavor intente nuevamente.',
      });

      // Reverting the inventory to the previous state of the current inventory operations
      await updateProducts(currentInventory);

      // Deleting the current inventory operation
      await deleteInventoryOperationsById(inventoryOperation);

      // Deleting the "descriptions" of the current inventory operation
      await deleteInventoryOperationDescriptionsById(inventoryOperationDescription);

      // Ensuring that the new day operation don't appear in the list of actions.
      await deleteAllDayOperations();

      await insertDayOperations(dayOperations);
      /* The user is not being redirected to the 'RouteOperationLayout' to avoid to re-make all the operation again. */
      return false;
    }

  } catch (error) {
    /* There were an error during the proecess. */
    Toast.show({
      type: 'error',
      text1: 'Ha habido un error durnate la operación de inventario.',
      text2: 'Ha habido un error durante el registro de la operación de inventario, porfavor intente nuevamente.',
    });

    // Reverting the inventory to the previous state of the current inventory operations
    await updateProducts(currentInventory);

    // Deleting the current inventory operation
    await deleteInventoryOperationsById(inventoryOperation);

    // Deleting the "descriptions" of the current inventory operation
    await deleteInventoryOperationDescriptionsById(inventoryOperationDescription);

    // Ensuring that the new day operation don't appear in the list of actions.
    await deleteAllDayOperations();

    await insertDayOperations(dayOperations);

    /* The user is not being redirected to the 'RouteOperationLayout' to avoid to re-make all the operation again. */

    return false;
  }
}

async function endShiftInventoryOperationProcess(
  cashInventory:ICurrency[],
  routeDay:IRoute&IDayGeneralInformation&IDay&IRouteDay,
  currentInventory:IProductInventory[],
  inventory:IProductInventory[],
  dayOperations:IDayOperation[],
  currentOperation:IDayOperation,
  dispatch: AppDispatch,
):Promise<boolean> {
  // Creating the inventory operation (this inventory operation is tied to the "work day").
  const inventoryOperation:IInventoryOperation
    = creatingInventoryOperation(routeDay, DAYS_OPERATIONS.end_shift_inventory);

  // Creating the movements of the inventory operation (also know as operation description).
  const inventoryOperationDescription:IInventoryOperationDescription[]
    = creatingInventoryOperationDescription(inventory, inventoryOperation);
  try {

    Toast.show({
      type: 'info',
      text1: 'Comenzando registro de inventario final.',
      text2: 'Registrando inventario final.',
    });

    // Storing information in embedded database.
    const resultInsertionInventoryOperation:IResponse<IInventoryOperation>
      = await insertInventoryOperation(inventoryOperation);

    // Storing information in embedded database.
    const resultInsertionInventoryOperationDescriptions
      :IResponse<IInventoryOperationDescription[]> =
        await insertInventoryOperationDescription(inventoryOperationDescription);

    // Updating inventory with the current inventory operation (current amount of product + amount to carry).
    /*
      Note: Product inventory has 2 items to be updated:
      - The product itself .
      - The operation itself (how many product the vendor is carrying or returning).
      - And the updated inventory, since it is the last operation, it is not needed to be updated.
    */

    const newInventory:IProductInventory[] = [];

    currentInventory.forEach((currentInventoryUpdate) => {
      const productFound:undefined|IProductInventory = inventory
        .find(productInventory => productInventory.id_product === currentInventoryUpdate.id_product);
        if (productFound !== undefined) {
          newInventory.push({
            ...productFound,
            amount: currentInventoryUpdate.amount,
          });
        }
    });

    // Updating information in embedded database.
    const resultUpdatingInventory:IResponse<IProductInventory[]>
      = await updateProducts(newInventory);


    // Updating list of day operations
    // Creating a work day operation for the "re-stock shift inventory".
    const newDayOperation:IDayOperation
      = creatingDayOperation(inventoryOperation.id_inventory_operation,
        currentOperation.id_type_operation, 0, 0);

    const listDayOperations:IDayOperation[] = [];
    /*
      Once all the processes have been stored, the day operation itself is created.

      There are two options:
        1 - Instert the specific item at the middle of the list of the day operations.
        2 - Delete and instert all the day operations, keeping the current information. The difference in this scenario is that
        the new operation is placing in the next position of the current operation.
        Delete and instert all the day operations, respecting the current information, with the differente of
        place the new operation in the position that correspond.

      Although this strategy of deleting and insterting the list of all the day operations, it is considered as better than
      keep updating the information.
    */

    /* Closing work day operation */
    Toast.show({
      type: 'info',
      text1: 'Cerrando el dia de trabajo.',
      text2: 'Guardando información necesaria para terminar el dia correctamente.',
    });
    /* Storing the end shift inventory of money and getting the date when the route was finished. */
    const dayGeneralInformation:IRoute&IDayGeneralInformation&IDay&IRouteDay
      = finishingWorkDay(cashInventory, routeDay);

    // Storing information in embedded database.
    const resultFinishingWorkDay:IResponse<IRoute&IDayGeneralInformation&IDay&IRouteDay>
      = await updateWorkDay(dayGeneralInformation);

    /* At this point the end shift operation has been finished.
        So, the task is going to be apendded at the end of the work day list */

    // Creating a copy of the list of the day operations.
    dayOperations.forEach(dayOperation => { listDayOperations.push(dayOperation); });

    // Since it is the end shift operation, it is exected that it is going to be the last operation.
    listDayOperations.push(newDayOperation);

    // Replacing the entire list of day operations in embedded datbase.
    // Delete all the information from the database.
    const resultdeletionAllDayOperations:IResponse<null> = await deleteAllDayOperations();

    // Store information in embedded database.
    const resultInsertionDayOperations:IResponse<IDayOperation[]>
      = await insertDayOperations(listDayOperations);

    /* At this moment the final operations has been done, now it is needed to display the summarazie of all the day */
    if (apiResponseStatus(resultInsertionInventoryOperation, 201)
    &&  apiResponseStatus(resultInsertionInventoryOperationDescriptions, 201)
    &&  apiResponseStatus(resultUpdatingInventory, 200)
    &&  apiResponseStatus(resultFinishingWorkDay, 200)
    &&  apiResponseStatus(resultdeletionAllDayOperations, 200)
    &&  apiResponseStatus(resultInsertionDayOperations, 201)) {
      // Updating redux context
      dispatch(addProductsInventory(inventory));

      // Storing information in redux context.
      dispatch(setDayGeneralInformation(dayGeneralInformation));

      // Store the information (new operation) in redux context.
      dispatch(setDayOperation(newDayOperation));

      Toast.show({type: 'success',
        text1:'Se ha registrado el inventario final exitosamente.',
        text2: 'Se ha registrado el inventario final exitosamente.'});

      return true;
    } else {
      /* Something was wrong during the final shift inventory */
      Toast.show({
        type: 'error',
        text1: 'Ha habido un error durnate el inventario final.',
        text2: 'Ha habido un error durante el registro de la operación del inventario final, porfavor intente nuevamente.',
      });

      // Reverting the inventory to the previous state of the current inventory operations
      await updateProducts(currentInventory);

      // Deleting the current inventory operation
      await deleteInventoryOperationsById(inventoryOperation);

      // Deleting the "descriptions" of the current inventory operation
      await deleteInventoryOperationDescriptionsById(inventoryOperationDescription);

      // Ensuring that the new day operation don't appear in the list of actions.
      await deleteAllDayOperations();

      await insertDayOperations(dayOperations);
      /* The user is not being redirected to the 'RouteOperationLayout' to avoid to re-make all the operation again. */

      return false;
    }
  } catch (error) {
    /* Something was wrong during the final shift inventory */
    Toast.show({
      type: 'error',
      text1: 'Ha habido un error durnate el inventario final.',
      text2: 'Ha habido un error durante el registro de la operación del inventario final, porfavor intente nuevamente.',
    });

    // Reverting the inventory to the previous state of the current inventory operations
    await updateProducts(currentInventory);

    // Deleting the current inventory operation
    await deleteInventoryOperationsById(inventoryOperation);

    // Deleting the "descriptions" of the current inventory operation
    await deleteInventoryOperationDescriptionsById(inventoryOperationDescription);

    // Ensuring that the new day operation don't appear in the list of actions.
    await deleteAllDayOperations();

    await insertDayOperations(dayOperations);
    /* The user is not being redirected to the 'RouteOperationLayout' to avoid to re-make all the operation again. */

    return false;
  }
}

const InventoryOperationLayout = ({ navigation }:{ navigation:any }) => {
  // Defining redux context
  const dispatch:AppDispatch = useDispatch();
  const productsInventory = useSelector((state: RootState) => state.productsInventory);
  const dayOperations = useSelector((state: RootState) => state.dayOperations);
  const routeDay = useSelector((state: RootState) => state.routeDay);
  const currentOperation = useSelector((state: RootState) => state.currentOperation);
  const stores = useSelector((state: RootState) => state.stores);

  // Defining states
  /* States that will store the movements in the operation. */
  const [inventory, setInventory] = useState<IProductInventory[]>([]);
  const [cashInventory, setCashInventory] = useState<ICurrency[]>(initialMXNCurrencyState());

  /* State to store infomration related to the product to be taken for the route. */
  const [suggestedProduct, setSuggestedProduct] = useState<IProductInventory[]>([]);

  /*
    current product state is used to store the current inventory (current inventory at the moment of
    making the inventory operation).
  */
  const [currentInventory, setCurrentInventory] = useState<IProductInventory[]>([]);

  /* States for inventory operation visualization. */
  const [initialShiftInventory, setInitialShiftInventory] = useState<IProductInventory[]>([]);
  const [restockInventories, setRestockInventories] = useState<IProductInventory[][]>([]);
  const [finalShiftInventory, setFinalShiftInventory] = useState<IProductInventory[]>([]);
  const [productRepositionTransactions, setProductRepositionTransactions]
    = useState<IProductInventory[]>([]);
  const [productSoldTransactions, setProductSoldTransactions] = useState<IProductInventory[]>([]);

  const [inventoryWithdrawal, setInventoryWithdrawal] = useState<boolean>(false);
  const [inventoryOutflow, setInventoryOutflow] = useState<boolean>(false);
  const [finalOperation, setFinalOperation] = useState<boolean>(false);
  const [issueInventory, setIssueInventory] = useState<boolean>(false);

  const [isOperation, setIsOperation] = useState<boolean>(true);

  /* States for route transaction operations */
  const [productSoldByStore, setProductSoldByStore] = useState<IProductInventory[][]>([]);
  const [productRepositionByStore, setProductRepositionByStore] 
    = useState<IProductInventory[][]>([]);
  const [nameOfStores, setNameOfStores] = useState<string[]>([]);


  // State used for the logic of the component
  const [isInventoryAccepted, setIsInventoryAccepted] = useState<boolean>(false);

  // Use effect operations
  useEffect(() => {
    /*
      If the current operation contains an item, that means that the user is consulting
      a previous inventory operation.
    */

    const settingResponseProducts:any = {
      showErrorMessage: true,
      toastTitleError: 'Error durante la consulta de productos',
      toastMessageError: 'Ha habido un error durante la consulta de los productos, por favor intente nuevamente',
    };

    getAllProducts()
    .then((responseProducts:IResponse<IProduct[]>) => {
      // Creating inventory (list) with all the products.
      let productInventory:IProductInventory[] = [];
      let products:IProduct[] = apiResponseProcess(responseProducts, settingResponseProducts);

      products.map(product => {
        productInventory.push({
          ...product,
          amount: 0,
        });
      });

      setInventory(productInventory);
    });

    if (currentOperation.id_item) { // It is a inventory operation visualization.
      let currentProductInventory:IProductInventory[] = [];

      // Variables used for final shift inventory
      let allInventoryOperations:IInventoryOperation[] = [];
      const startShiftInventoryProduct:IProductInventory[] = [];
      const restockInventoryProduct:IProductInventory[][] = [];

      // Each "array" represents the total of product for each concept made during the day
      const productRepositionInventoryProductByStore:IProductInventory[][] = [];
      const productSoldInventoryProductByStore:IProductInventory[][] = [];
      const titleOfStores:string[] = [];

      // These objects store the "total amount" of product for each concept
      // Information comes from "route transactions"
      let productRepositionInventoryProduct:any = {};
      let productSoldInventoryProduct:any = {};

      /*
        Since it is an visualization, it is need to 'reset' the states related to
        'inventory operations'.
      */
      setCurrentInventory([]);
      setInventory([]);
      setIsOperation(false);


      const settingOperationDescriptions:any = {
        showErrorMessage: true,
        toastTitleError: 'Error durante la consulta de la operación de inventario',
        toastMessageError: 'Ha habido un error durante la consulta, no se ha podido recuperar parte de las operaciones de inventario, por favor intente nuevamente',
      };
      const settingAllInventoryOperations:any = {
        showErrorMessage: true,
        toastTitleError:'Error al mostrar inventario final',
        toastMessageError: 'Ha habido un error durante la consulta de las operaciones de inventario del dia, por favor intente nuevamente',
      };
      const settingOperationDescriptionsFinalInventory:any = {
        showErrorMessage: true,
        toastTitleError:'Error en mostrar el inventario final',
        toastMessageError: 'Ha habido un error durante la consulta de las operaciones que componen el inventario final, por favor intente nuevamente',
      };
      const settingFinalInventoryByStores:any = {
        showErrorMessage: true,
        toastTitleError:'Error al mostrar inventario final',
        toastMessageError: 'Ha habido un error durante la consulta de los movimientos de producto por tienda',
      };

      // Getting the inventory operation.
      getInventoryOperation(currentOperation.id_item)
      .then(async (inventoryOperation) => {

          // Getting the movements of the inventory operation that the user wants to see.
          let inventoryOperationDescriptions:IInventoryOperationDescription[] = apiResponseProcess(await getInventoryOperationDescription(currentOperation.id_item),
            settingOperationDescriptions);

          inventoryOperationDescriptions.forEach((inventoryOperationDescription) => {
            currentProductInventory.push({
              ...initialProduct,
              amount: inventoryOperationDescription.amount,
              id_product: inventoryOperationDescription.id_product,
              price: inventoryOperationDescription.price_at_moment,
            });
          });

          /*
            Depending on which inventory operation the vendor wants to see are the actions that
            are going to be taken to display correctly the information.
          */

          // Reseting calculations in product visualization
          setInventoryWithdrawal(false);
          setInventoryOutflow(false);
          setFinalOperation(false);
          setIssueInventory(false);

          if (currentOperation.id_type_operation === DAYS_OPERATIONS.start_shift_inventory) {
            setInitialShiftInventory(currentProductInventory);
            setRestockInventories([]);
            setFinalShiftInventory([]);
          } else if (currentOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory
          || currentOperation.id_type_operation === DAYS_OPERATIONS.product_devolution_inventory) {
            setInitialShiftInventory([]);
            setRestockInventories([currentProductInventory]);
            setFinalShiftInventory([]);
          } else if (currentOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory) {

            // Variables used by the process.
            let inventoryOperations:IInventoryOperation[] = [];
            let productInventoryOfInventoryOperation:IProductInventory[] = [];

            setInventoryWithdrawal(true);
            setInventoryOutflow(true);
            setFinalOperation(true);
            setIssueInventory(true);
            /*
              End shift inventory is an special case. This inventory visualization intends to show the summarize of
              all the inventory operations that were made during the route.

              In this way, it is needed to get all the inventory operations of the day (inflow and remaining of product):
              - Initial inventory
              - Re-stock inventory
              - Final invnetory

              And also, it is needed to retrieve the outflow of product:
                - product reposition transactions
                - selling transactions

              Product devolution is not included becuase it is considered as another inventory out
              of the product inventory of the day.
            */

              inventoryOperations = apiResponseProcess(await getAllInventoryOperations(),
                settingAllInventoryOperations);

            // Get all the inventory operations
              inventoryOperations.forEach((currentInventoryOperation:IInventoryOperation) => {
                allInventoryOperations.push(currentInventoryOperation);
              });

            // Get all the descriptions for each inventory operation
            for (let i = 0; i < allInventoryOperations.length; i++) {
              const { id_inventory_operation, id_type_of_operation } = allInventoryOperations[i];

              // Get description (movements) of the current inventory oepration
              apiResponseProcess(await getInventoryOperationDescription(id_inventory_operation),
                settingOperationDescriptionsFinalInventory)
                .map((inventoryOperationDescription:IInventoryOperationDescription) =>
                {
                  return {
                    ...initialProduct,
                    amount: inventoryOperationDescription.amount,
                    id_product: inventoryOperationDescription.id_product,
                    price: inventoryOperationDescription.price_at_moment,
                  };
                });

              // Determining where to store the information of the current inventory operation.
              if (id_type_of_operation === DAYS_OPERATIONS.start_shift_inventory) {
                productInventoryOfInventoryOperation
                  .forEach((product:IProductInventory) =>
                    {startShiftInventoryProduct.push(product);});
              } else if (id_type_of_operation === DAYS_OPERATIONS.restock_inventory) {
                restockInventoryProduct.push(productInventoryOfInventoryOperation);
              } else {
                /* Other case of operations are ignored */
              }
            }

            // Get the "inventory" of the "route transactions".
            /*
              Route transactions and invnetory transactions have their own format, but
              route transactions can be "formated" as if they were an "inventory operation"
            */
            /*
              The information of this section is used for two purposes:
              - Summarize of all the day.
              - Summarize by store of the day.
            */
            for(let i = 0; i < stores.length; i++) {
              const {id_store, store_name} = stores[i];

              // Variables used by the responses
              let routeTransactionsOperationsByStore:IRouteTransactionOperation[] = [];

              // Variables to store the information about the "route transactions" of the stores.
              const transactionOfTheStore:IRouteTransaction[] = [];
              const transactionOperationsOfTheStore:IRouteTransactionOperation[] = [];

              // Variables to store the route transactions (total of amount of product) by stores.
              let productsInventoryOfRepositionOfStore:any = {};
              let productsInventoryOfSaleOfStore:any = {};

              // Storing the name of the corner store
              titleOfStores.push(store_name);

              // Getting transactions of the current store
              apiResponseProcess(await getRouteTransactionByStore(id_store),
                settingFinalInventoryByStores)
                .forEach((transaction:IRouteTransaction) => {
                  const { state } = transaction;
                  // It is only going to be stored active transactions
                  if (state === 1) {
                    transactionOfTheStore.push(transaction);
                  } else {
                    /* There is no instructions */
                  }
                });


              // Getting the transaction operations of the current store
              for(let j = 0; j < transactionOfTheStore.length; j++) {
                const { id_route_transaction } = transactionOfTheStore[j];

                routeTransactionsOperationsByStore =
                  apiResponseProcess(await getRouteTransactionOperations(id_route_transaction),
                    settingFinalInventoryByStores);

                routeTransactionsOperationsByStore
                  .forEach((transactionOperations:IRouteTransactionOperation) =>
                    { transactionOperationsOfTheStore.push(transactionOperations); });
              }

              // Getting the description of each transaction operation of the current store
              for(let j = 0; j < transactionOperationsOfTheStore.length; j++) {
                const {
                  id_route_transaction_operation,
                  id_route_transaction_operation_type,
                } = transactionOperationsOfTheStore[j];

                // Accordig with the type of operations are the instructions to make
                apiResponseProcess(
                  await getRouteTransactionOperationDescriptions(id_route_transaction_operation),
                  settingFinalInventoryByStores)
                  .forEach((operationDescription) => {
                    const {
                      amount,
                      id_product,
                      price_at_moment,
                    } = operationDescription;

                    // Accordig with the type of operations are the instructions to make
                    if (id_route_transaction_operation_type === DAYS_OPERATIONS.product_reposition) {
                      // Getting information of the current store
                      productsInventoryOfRepositionOfStore =
                      addingInformationParticularFieldOfObject(productsInventoryOfRepositionOfStore, id_product, 'amount', amount,
                        {
                          ...initialProduct,
                          amount: amount,
                          id_product: id_product,
                          price: price_at_moment,
                        }
                      );

                      // Adding the information of this transaction to the total information of the day
                      productRepositionInventoryProduct =
                        addingInformationParticularFieldOfObject(productRepositionInventoryProduct,
                          id_product, 'amount', amount,
                          {
                            ...initialProduct,
                            amount: amount,
                            id_product: id_product,
                            price: price_at_moment,
                          }
                        );

                    } else if(id_route_transaction_operation_type === DAYS_OPERATIONS.sales) {

                      // Getting information by store
                      productsInventoryOfSaleOfStore =
                        addingInformationParticularFieldOfObject(productsInventoryOfSaleOfStore,
                          id_product, 'amount', amount,
                          {
                            ...initialProduct,
                            amount: amount,
                            id_product: id_product,
                            price: price_at_moment,
                          }
                        );

                      // Getting information of the current store
                      productSoldInventoryProduct =
                        addingInformationParticularFieldOfObject(productSoldInventoryProduct,
                          id_product, 'amount', amount,
                          {
                            ...initialProduct,
                            amount: amount,
                            id_product: id_product,
                            price: price_at_moment,
                          }
                        );
                    } else {
                      /* All the other operations don't matter */
                    }
                  });
              }
              // Storing the information of the current store within the rest of the stores.
              productRepositionInventoryProductByStore.push(
                convertingDictionaryInArray(productsInventoryOfRepositionOfStore));

              productSoldInventoryProductByStore.push(
                convertingDictionaryInArray(productsInventoryOfSaleOfStore));
            }

            // Storing route transactions information in states.
            setNameOfStores(titleOfStores);
            setProductRepositionByStore(productRepositionInventoryProductByStore);
            setProductSoldByStore(productSoldInventoryProductByStore);


            /*
              These variables have the total amount of product for each concept, but they are stored by corner store:
              - productRepositionInventoryProduct
              - soldProductInventoryProduct

              Now, it is needed to "reduce" them into a single array for display them in the "inventory visualizator component".
            */
            // Storing information relate to route transactions
            setProductRepositionTransactions(
              convertingDictionaryInArray(productRepositionInventoryProduct));
            setProductSoldTransactions(convertingDictionaryInArray(productSoldInventoryProduct));

            // Storing information related to the inventory operations
            setInitialShiftInventory(startShiftInventoryProduct);
            setRestockInventories(restockInventoryProduct);

            // This information is retrieved with the "currentOperation" state.
            setFinalShiftInventory(currentProductInventory);
          } else {
            /* Other inventory operation */
          }
      })
      .catch(() => {
        Toast.show({
          type: 'error',
          text1: 'Error durante la recuperación de la operacion de inventario.',
          text2: 'Ha ocurrido un error durante la recuperación de la operación de inventario.',
        });
      });

    } else { // It is a new inventory operation
      /*
        It is a product inventory operation.

        Although there are 4 types of product inventory operations, it doesn't really matter which operation is currently made,
        all of them will imply a 'product' movement, so it is needed the complete list with all the products.

        Inventory operations:
        - Start shift inventory
        - Re-stock inventory
        - Product devolution inventory
        - Final shift inventory

        In addition, we don't know which product the vendor is going to take to the route, or which one is going to
        bring back from the route, so the better option is to dipose the list of all the products.
      */

      if (currentOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory) {
        /* If it is a restock inventory operation, it is needed to get the current inventory */
        getProducts()
        .then((allProductsResponse:IResponse<IProductInventory[]>) => {
          let allProducts:IProductInventory[] = apiResponseProcess(allProductsResponse,
            settingResponseProducts);
          setCurrentInventory(allProducts);
        })
        .catch(() => {
          Toast.show({
            type: 'error',
            text1: 'Error durante la creación de la operación de inventario.',
            text2: 'Ha habido un error al momento de obtener el producto para la operación de inventario.',
          });
          setCurrentInventory([]);
        });
      } else {
        setCurrentInventory([]);
      }

      /* State for determining if it is a product inventory operation or if it is an operation. */
      setIsOperation(true);
    }

    // Determining where to redirect in case of the user touch the handler "back handler" of the phone
    const backAction = () => {
      if (currentOperation.id_type_operation === '') {
        navigation.navigate('selectionRouteOperation');
      } else {
        navigation.navigate('routeOperationMenu');
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentOperation, stores, navigation]);

  // Handlers
  const handlerGoBack = () => {
    /*
      According with the workflow of the system, the system identify if the user is making the first "inventory
      operation" of the day (referring to "Start shift inventory operation") when the current operation is undefined.

      In this case, the navigation should return to the select inventory reception.

      Following the scenario below, once the user finishes the first operation, all of the following operations
      should return to the route menu.
    */
    if (currentOperation.id_type_operation === '') {
      navigation.navigate('selectionRouteOperation');
    } else {
      navigation.navigate('routeOperationMenu');
    }
  };

  const handlerReturnToRouteMenu = async ():Promise<void> => {
    navigation.navigate('routeOperationMenu');
  };

  const handleVendorConfirmation = async ():Promise<void> => {
    // By default it is considered that the process is going to fail.
    let processResult:boolean = false;
    try {
      /* Avoiding re-executions in case of inventory */
      if (isInventoryAccepted === true) {
        return;
      }

      setIsInventoryAccepted(true);
      /*
        There are 3 types of inventory operations:
        - Start shift inventory: Unique in the day.
        - Re-stock inventory: It might be several ones.
        - End shift inventory: Unique in the day.
          - This inventory operation is subdivided into 2 inventory type
            - Devolutions
            - Remainded products
      */

      // Determining the type of inventory operation.
      if (currentOperation.id_type_operation === DAYS_OPERATIONS.start_shift_inventory) {
        processResult = await startShiftInventoryOperationProcess(cashInventory, routeDay, inventory, currentOperation, dispatch);

        if (processResult) {
          navigation.reset({
            index: 0, // Set the index of the new state (0 means first screen)
            routes: [{ name: 'routeOperationMenu' }], // Array of route objects, with the route to navigate to
          });

          navigation.navigate('routeOperationMenu');
        } else {
          /*
            Since this is the operations of the day, it is important to ensure the integrity of
            the workflow, thus, to achieve this, it is needed to redirect the user to the main manu
            to force complete all the process again.
          */
            navigation.reset({
              index: 0, // Set the index of the new state (0 means first screen)
              routes: [{ name: 'selectionRouteOperation' }], // Array of route objects, with the route to navigate to
            });

            navigation.navigate('selectionRouteOperation');
        }
      } else if(currentOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory
             || currentOperation.id_type_operation === DAYS_OPERATIONS.product_devolution_inventory)
      {
        processResult = await intermediateInventoryOperationProcess(
          routeDay,
          inventory,
          currentInventory,
          currentOperation,
          dayOperations,
          dispatch
        );

        if(processResult) {
          if (currentOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory) {
            /* The inventory operation was a "restock inventory" */
            navigation.reset({
              index: 0, // Set the index of the new state (0 means first screen)
              routes: [{ name: 'routeOperationMenu' }], // Array of route objects, with the route to navigate to
            });
            navigation.navigate('routeOperationMenu');
          } else {
            Toast.show({
              type: 'info',
              text1: 'Preparando el inventario final.',
              text2: 'Preparando información para registrar el inventario final.',
            });
            // Reseting states for making the end shift inventory.
            const newInventoryForFinalOperation = inventory.map((proudct:IProductInventory) => {
              return {
                ...proudct,
                amount: 0,
              };
            });
            setInventory(newInventoryForFinalOperation);
            setIsOperation(true);
            setIsInventoryAccepted(false); // State to avoid double-click
          }
        } else {
          /*
            There is not instructions; If the process fails, the information that is currently
            stored in memory can be used to try again, that is the reason of why it is not being
            redirected to the route operation menu.
          */
        }
      } else if (currentOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory) {
        processResult = await endShiftInventoryOperationProcess(cashInventory, routeDay, currentInventory, inventory, dayOperations, currentOperation, dispatch);

        if(processResult) {
          navigation.reset({
            index: 0, // Set the index of the new state (0 means first screen)
            routes: [{ name: 'routeOperationMenu' }], // Array of route objects, with the route to navigate to
          });
          navigation.navigate('routeOperationMenu');
        } else {
          /*
            Since it is the final inventory, the information that is in the screen can be used
            to try again.
          */
        }
      } else {
        /* At the moment, there is not a default case */
      }
    } catch (error) {
      setIsInventoryAccepted(false);
    }
  };

  const handlerOnVendorCancelation = () => {
    if (currentOperation.id_type_operation === DAYS_OPERATIONS.start_shift_inventory) {
      /*
        Vendor might change the day of route (it might be the reason of why he
        didn't finish the first inventory).

        In this case, the application must redirect to the route operation selection to
        make able to the vendor to select a route.
      */
     navigation.navigate('routeSelection');
    } else {
      /*
        Since it is not the start shift inventory, it means the vendor is already making a route.
      */
      navigation.navigate('routeOperationMenu');
    }
  };

  return (
    <ScrollView style={tw`w-full flex flex-col`}>
      <View style={tw`mt-3 w-full flex basis-1/6`}>
        <RouteHeader onGoBack={handlerGoBack}/>
      </View>
      {/* Product inventory section. */}
      <Text style={tw`w-full text-center text-black text-2xl`}>
        {getTitleOfInventoryOperation(currentOperation)}
      </Text>

      {/* Inventory product section */}
      {/* Depending on the action is that one menu or another one will be displayed. */}
      { isOperation ?
        <View style={tw`flex basis-auto w-full mt-3`}>
          <TableInventoryOperations
            suggestedInventory={suggestedProduct}
            currentInventory={currentInventory}
            operationInventory={inventory}
            setInventoryOperation={setInventory}
            currentOperation={currentOperation}/>
        </View>
        :
        <View style={tw`flex basis-auto w-full mt-3`}>
          <TableInventoryVisualization
            inventory             = {productsInventory}
            suggestedInventory    = {suggestedProduct}
            initialInventory      = {initialShiftInventory}
            restockInventories    = {restockInventories}
            soldOperations        = {productSoldTransactions}
            repositionsOperations = {productRepositionTransactions}
            returnedInventory     = {finalShiftInventory}
            inventoryWithdrawal   = {inventoryWithdrawal}
            inventoryOutflow      = {inventoryOutflow}
            finalOperation        = {finalOperation}
            issueInventory        = {issueInventory}/>
          { currentOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory &&
            <View style={tw`flex basis-auto w-full mt-3`}>
              <Text style={tw`w-full text-center text-black text-2xl`}>
                Producto vendido por tienda
              </Text>
              <TableInventoryOperationsVisualization
                inventory             = {productsInventory}
                titleColumns          = {nameOfStores}
                productInventories    = {productSoldByStore}
                calculateTotal        = {true}/>
              <Text style={tw`w-full text-center text-black text-2xl`}>
                Reposición de producto por tienda
              </Text>
                <TableInventoryOperationsVisualization
                  inventory             = {productsInventory}
                  titleColumns          = {nameOfStores}
                  productInventories    = {productRepositionByStore}
                  calculateTotal        = {true}
                  />
            </View>
          }
        </View>
      }
      {/* Cash reception section. */}
      {((currentOperation.id_type_operation === DAYS_OPERATIONS.start_shift_inventory
      || currentOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory)
      && isOperation) &&
        /*
          The reception of money can only be possible in tow scenarios:
            1. Start shift inventory operation.
            2. End shift inventory operation.
        */
        <View style={tw`flex basis-auto w-full mt-3`}>
          <Text style={tw`w-full text-center text-black text-2xl`}>Dinero</Text>
          <TableCashReception
            cashInventoryOperation={cashInventory}
            setCashInventoryOperation={setCashInventory}
          />
          <Text style={tw`w-full text-center text-black text-xl mt-2`}>
            Total:
            ${cashInventory.reduce((accumulator, denomination) => {
                return accumulator + denomination.amount! * denomination.value;},0)}
            </Text>
        </View>
      }
      { ((currentOperation.id_type_operation === DAYS_OPERATIONS.start_shift_inventory
      || currentOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory) && !isOperation) &&
        <View style={tw`w-11/12 ml-3 flex flex-col basis-auto mt-3`}>
          <Text style={tw`text-black text-lg`}>
            Dinero llevado al inicio de la ruta: ${routeDay.start_petty_cash}
          </Text>
        </View>
      }
      { (currentOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory && !isOperation) &&
        <View style={tw`w-11/12 ml-3 flex flex-col basis-auto mt-3`}>
          <Text style={tw`text-black text-lg`}>
            Dinero regresado al final de la ruta: ${routeDay.final_petty_cash}
          </Text>
        </View>
      }
      <View style={tw`flex basis-1/6 mt-3`}>
        <VendorConfirmation
          onConfirm={isOperation ? handleVendorConfirmation : handlerReturnToRouteMenu}
          onCancel={isOperation ? handlerOnVendorCancelation : handlerReturnToRouteMenu}
          message={'Escribiendo mi numero de telefono y marcando el cuadro de texto acepto tomar estos productos.'}
          confirmMessageButton={isOperation ? 'Aceptar' : 'Volver al menú'}
          cancelMessageButton={isOperation ? 'Cancelar' : 'Volver al menú'}
          requiredValidation={isOperation}/>
      </View>
      <View style={tw`flex basis-1/6`} />
    </ScrollView>
  );
};

export default InventoryOperationLayout;
