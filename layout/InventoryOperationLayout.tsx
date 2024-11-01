// Libraries
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, BackHandler } from 'react-native';
import 'react-native-get-random-values'; // Necessary for uuid
import {v4 as uuidv4 } from 'uuid';
import tw from 'twrnc';

// Components
import RouteHeader from '../components/RouteHeader';
import TableInventoryOperations from '../components/InventoryComponents/TableInventoryOperations';
import VendorConfirmation from '../components/VendorConfirmation';
import TableInventoryVisualization from '../components/InventoryComponents/TableInventoryVisualization';

// Queries
// Central database
import {
  getAllProducts,
  getAllStoresInARouteDay,
  getStoresByArrID,
} from '../queries/queries';

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
  updateProducts,
  deleteAllDayOperations,
} from '../queries/SQLite/sqlLiteQueries';


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
 } from '../interfaces/interfaces';

// Utils
import DAYS_OPERATIONS from '../lib/day_operations';
import TableCashReception from '../components/InventoryComponents/TableCashReception';
import { timestamp_format } from '../utils/momentFormat';
import { planningRouteDayOperations } from '../utils/routesFunctions';
import { determineRouteDayState } from '../utils/routeDayStoreStatesAutomata';
import { enumStoreStates } from '../interfaces/enumStoreStates';
import { initialMXNCurrencyState } from '../utils/inventoryOperations';

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

async function creatingNewWorkDay(cashInventory:ICurrency[],
  routeDay:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<IRoute&IDayGeneralInformation&IDay&IRouteDay> {
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
    let startPettyCash:number = cashInventory.reduce((acc, currentCurrency) =>
      { if (currentCurrency.amount === undefined) {return acc;} else {return acc + currentCurrency.amount * currentCurrency.value;}}, 0);

    // General information about the route.
    const dayGeneralInformation:IDayGeneralInformation = {
      id_work_day: uuidv4(),
      start_date : timestamp_format(),
      finish_date: timestamp_format(),
      start_petty_cash: startPettyCash,
      final_petty_cash: 0,
    };

    // Concatenating all the information.
    return {...dayGeneralInformation, ...routeDay};
  } catch (error) {
    return workDay;
  }
}

async function gettingStoresInformation(storesInRoute:IRouteDayStores[]):Promise<(IStore&IStoreStatusDay)[]> {
  try {
    const stores:(IStore&IStoreStatusDay)[] = [];

    // Getting the information of the stores.

    /*
      In addition of the information of the stores, it is determined the "state" for each store during the route.

      The state is a way to determine the status of a store in route (if it is pending to visit, if it has been visited,
      if it is a new client, etc).
    */
    (await getStoresByArrID(storesInRoute.map((storeInRoute:IRouteDayStores) => {return storeInRoute.id_store;})))
      .map((storeInformation) => stores.push({
        ...storeInformation,
        route_day_state: determineRouteDayState(enumStoreStates.NUETRAL_STATE, 1),
      }));

    return stores;
  } catch (error) {
    return [];
  }
}

async function gettingRouteInformationOfTheStores(routeDay:IRouteDay):Promise<IRouteDayStores[]> {
  try {
    const storesInTheRoute:IRouteDayStores[] = [];

    /*
      Getting the particular stores that belongs to the route day.
      In addition, this query provides the position of each store in the day.
    */
    // Getting the stores that belongs to this particular day of the route
    (await getAllStoresInARouteDay(routeDay.id_route_day))
      .forEach((storeInRouteDay) => {storesInTheRoute.push(storeInRouteDay);});

    return storesInTheRoute;
  } catch (error) {
    return [];
  }
}

function creatingInventoryOperation(dayGeneralInformation:IDayGeneralInformation):IInventoryOperation {
  const inventoryOperation:IInventoryOperation = {
    id_inventory_operation: '',
    sign_confirmation: '',
    date: '',
    audit: 0,
    id_type_of_operation: '',
    id_work_day: '',
  };
  try {
    // Creating the inventory operation (this inventory operation is tied to the "work day").
    inventoryOperation.id_inventory_operation = uuidv4();
    inventoryOperation.sign_confirmation = '1';
    inventoryOperation.date = timestamp_format();
    inventoryOperation.audit = 0;
    inventoryOperation.id_type_of_operation = DAYS_OPERATIONS.start_shift_inventory;
    inventoryOperation.id_work_day = dayGeneralInformation.id_work_day;

    return inventoryOperation;
  } catch (error) {
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

const InventoryOperationLayout = ({ navigation }:{ navigation:any }) => {
  // Defining redux context
  const dispatch: AppDispatch = useDispatch();
  const productsInventory = useSelector((state: RootState) => state.productsInventory);
  const dayOperations = useSelector((state: RootState) => state.dayOperations);
  const routeDay = useSelector((state: RootState) => state.routeDay);
  const currentOperation = useSelector((state: RootState) => state.currentOperation);

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
  const [isOperation, setIsOperation] = useState<boolean>(true);
  const [enablingFinalInventory, setEnablingFinalInventory] = useState<boolean>(true);

  // State used for the logic of the component
  const [isInventoryAccepted, setIsInventoryAccepted] = useState<boolean>(false);

  // Use effect operations
  useEffect(() => {
    /*
      If the current operation contains an item, that means that the user is consulting
      a previous inventory operation.
    */

    getAllProducts()
    .then(products => {
      // Creating inventory (list) with all the products.
      let productInventory:IProductInventory[] = [];
      products.map(product => {
        productInventory.push({
          ...product,
          amount: 0,
        });
      });
      setInventory(productInventory);
    });

    if (currentOperation.id_item) { // It is a inventory operation visualization.
      let productInventory:IProductInventory[] = [];

      /*
        Since it is an visualization, it is need to 'reset' the states related to
        'inventory operations'.
      */
      setCurrentInventory([]);
      setInventory([]);
      setIsOperation(false);

      // Getting the inventory operation.
      getInventoryOperation(currentOperation.id_item)
        .then((inventoryOperation) => {
          // Getting the movements of the inventory operation.
          getInventoryOperationDescription(currentOperation.id_item)
            .then((inventoryOperationDescriptions) => {
              inventoryOperationDescriptions.forEach((inventoryOperationDescription) => {
                productInventory.push({
                  ...initialProduct,
                  amount: inventoryOperationDescription.amount,
                  id_product: inventoryOperationDescription.id_product,
                  price: inventoryOperationDescription.price_at_moment,
                });
              });

              /*
                Depending on what inventory operation the vendor want to see, is how the
                state will be filled.
              */
              if (currentOperation.id_type_operation === DAYS_OPERATIONS.start_shift_inventory) {
                console.log(productInventory);
                setInitialShiftInventory(productInventory);
                setRestockInventories([]);
                setFinalShiftInventory([]);
              } else if (currentOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory) {
                setInitialShiftInventory([]);
                setRestockInventories([productInventory]);
                setFinalShiftInventory([]);
              } else if (currentOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory) {
                setInitialShiftInventory([]);
                setRestockInventories([]);
                setFinalShiftInventory(productInventory);
              }

          }).catch((error) => { console.error('Something went wrong: ', error);});
      }).catch((error) => { console.error('Something went wrong: ', error);});

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
     setCurrentInventory(inventory);

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
  }, []);

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
        /*
          Implicitly when the vendor closes the first inventory of the day, he accepts to perform the currnet day.
          So, before creating the first inventory of the day, it is needed to create the "work day".

          At this moment, all of these information is already recorded:
            - route: Information related to the route identification.
            - day: The information of the day.
            - routeDay: Information that relates the day to perform and the route.

          But it is needed to complete the remainded information:
            - General information related to the route.
        */
        const dayGeneralInformation:IRoute&IDayGeneralInformation&IDay&IRouteDay = await creatingNewWorkDay(cashInventory, routeDay);

        // Storing information in embedded database.
        await insertWorkDay(dayGeneralInformation);

        // Storing information in redux context.
        dispatch(setDayGeneralInformation(dayGeneralInformation));

        /* Once the workday has been declared, it is necessary to get the information of the stores */
        const storesInTheRoute:IRouteDayStores[] = await gettingRouteInformationOfTheStores(routeDay);
        const stores:(IStore&IStoreStatusDay)[] = await gettingStoresInformation(storesInTheRoute);

        // Storing in embedded database
        await insertStores(stores);

        // Storing in redux context.
        dispatch(setStores(stores));

        /* After "selecting" the route, the vendor must make the a "start shift inventory" (to have product for selling). */
        const inventoryOperation:IInventoryOperation = creatingInventoryOperation(dayGeneralInformation);
        const inventoryOperationDescription:IInventoryOperationDescription[]
          = creatingInventoryOperationDescription(inventory, inventoryOperation);

        // Inventory operation.
        /* Due to this information is low read data, it is going to be stored only in the embedded database. */
        /* Related to the inventory operation */
        // Storing information in embedded database.
        await insertInventoryOperation(inventoryOperation);

        // Storing information in embedded database.
        await insertInventoryOperationDescription(inventoryOperationDescription);

        /* Related to the inventory that the vendo will use to sell */
        // Storing information in redux context.
        dispatch(setProductInventory(inventory));

        /* Related to the product information */
        // Storing information in embedded database.
        await insertProducts(inventory);

        /*
          At this moment, it has been collected all the information needed for the work day,
          so it is needed to organize the operations that the vendor is going to do throughout the day a.k.a
          work day operations.
        */

        // Creating a work day operation for the "start shift inventory".
        const newDayOperation:IDayOperation
          = creatingDayOperation(inventoryOperation.id_inventory_operation, currentOperation.id_type_operation, 0, 1);

        await insertDayOperation(newDayOperation);

        // Store information in redux context.
        dispatch(setDayOperation(newDayOperation));

        // Store information in embedded database.
        // Start shift inventory is not longer the current activity.
        newDayOperation.current_operation = 0;

        // Getting the rest of the day operations (the stores that are going to be visited)
        let dayOperationsOfStores:IDayOperation[] = planningRouteDayOperations(storesInTheRoute);

        // Storing in redux state.
        dispatch(setArrayDayOperations(dayOperationsOfStores));

        // Storing in embedded database
        if (dayOperationsOfStores.length > 0) {
          // The first store of the route is now the new current operation.
          dayOperationsOfStores[0].current_operation = 1;
        }

        await insertDayOperations(dayOperationsOfStores);

        /*
          At this point the records needed to start a database have been created.
          In the workflow of the application, the first operation has been completed (starting
          shift inventory), so it is needed to advance to the next operation (first store of
          the route).
        */
        dispatch(setNextOperation());

        navigation.reset({
          index: 0, // Set the index of the new state (0 means first screen)
          routes: [{ name: 'routeOperationMenu' }], // Array of route objects, with the route to navigate to
        });

        navigation.navigate('routeOperationMenu');
      } else if(currentOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory
             || currentOperation.id_type_operation === DAYS_OPERATIONS.product_devolution_inventory) {
        /*
          It is a re-stock inventory or a product devolution operation.

          Although both operations are conceptually different, both share that are just a movement of
          product. It depends in the "id_type_operation if it is an inflow/outflow" of the products.
         */

        // Creating the inventory operation (this inventory operation is tied to the "work day").
        const inventoryOperation:IInventoryOperation = creatingInventoryOperation(routeDay);

        // Creating the movements of the inventory operation (also know as operation description).
        const inventoryOperationDescription:IInventoryOperationDescription[]
          = creatingInventoryOperationDescription(inventory, inventoryOperation);

        // Storing information in embedded database.
        await insertInventoryOperation(inventoryOperation);

        // Storing information in embedded database.
        await insertInventoryOperationDescription(inventoryOperationDescription);

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

        // Updating redux context
        dispatch(addProductsInventory(inventory));

        // Updating information in embedded database.
        await updateProducts(newInventory);


        // Updating list of day operations
        // Creating a work day operation for the "re-stock shift inventory".
        const newDayOperation:IDayOperation
          = creatingDayOperation(inventoryOperation.id_inventory_operation, currentOperation.id_type_operation, 0, 0);
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

        /* Getting the index of the current operation*/
        const index = dayOperations.findIndex(dayOperation => dayOperation.current_operation === 1);

        // Creating a copy of the list of the day operations.
        dayOperations.forEach(dayOperation => { listDayOperations.push(dayOperation); });

        if (index === -1) { // Case on which the re-stock operation is the last operation in the day.
          listDayOperations.push(newDayOperation);
        } else { // Case on which the re-stock operation is at the middle of the day (between other day operations).
          listDayOperations.splice(index, 0, newDayOperation);
        }

        // Store the information (new operation) in redux context.
        dispatch(setDayOperationBeforeCurrentOperation(newDayOperation));

        // Replacing the entire list of day operations in embedded datbase.
        // Delete all the information from the database.
        await deleteAllDayOperations();

        // Store information in embedded database.
        await insertDayOperations(listDayOperations);


        /*
          It is just at the final, when the process differs one from other.

          While in the re-stock inventory the vendor is returned to the route main operation, the product devolution
          continues with the final product.
        */
        if (currentOperation.id_type_operation === DAYS_OPERATIONS.product_devolution_inventory) {
          // Final operation
          // Creating a new work day operation.
          let nextDayOperation:IDayOperation
            = creatingDayOperation(inventoryOperation.id_inventory_operation, DAYS_OPERATIONS.end_shift_inventory, 0, 0);
          setCurrentOperation(nextDayOperation);

          // Reseting variables
          const newInventoryForFinalOperation = inventory.map((proudct:IProductInventory) => {
            return {
              ...proudct,
              amount: 0,
            };
          });

          setInventory(newInventoryForFinalOperation);
          setCurrentInventory(newInventoryForFinalOperation);

        } else {
          navigation.reset({
            index: 0, // Set the index of the new state (0 means first screen)
            routes: [{ name: 'routeOperationMenu' }], // Array of route objects, with the route to navigate to
          });
          navigation.navigate('routeOperationMenu');
        }
      } else if (currentOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory) {
        // Creating the inventory operation (this inventory operation is tied to the "work day").
        const inventoryOperation:IInventoryOperation = creatingInventoryOperation(routeDay);

        // Creating the movements of the inventory operation (also know as operation description).
        const inventoryOperationDescription:IInventoryOperationDescription[]
          = creatingInventoryOperationDescription(inventory, inventoryOperation);

        // Storing information in embedded database.
        await insertInventoryOperation(inventoryOperation);

        // Storing information in embedded database.
        await insertInventoryOperationDescription(inventoryOperationDescription);

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

        // Updating redux context
        dispatch(addProductsInventory(inventory));

        // Updating information in embedded database.
        await updateProducts(newInventory);


        // Updating list of day operations
        // Creating a work day operation for the "re-stock shift inventory".
        const newDayOperation:IDayOperation
          = creatingDayOperation(inventoryOperation.id_inventory_operation, currentOperation.id_type_operation, 0, 0);
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

        /* Getting the index of the current operation*/
        const index = dayOperations.findIndex(dayOperation => dayOperation.current_operation === 1);

        // Creating a copy of the list of the day operations.
        dayOperations.forEach(dayOperation => { listDayOperations.push(dayOperation); });

        if (index === -1) { // Case on which the re-stock operation is the last operation in the day.
          listDayOperations.push(newDayOperation);
        } else { // Case on which the re-stock operation is at the middle of the day (between other day operations).
          listDayOperations.splice(index, 0, newDayOperation);
        }

        // Store the information (new operation) in redux context.
        dispatch(setDayOperationBeforeCurrentOperation(newDayOperation));

        // Replacing the entire list of day operations in embedded datbase.
        // Delete all the information from the database.
        await deleteAllDayOperations();

        // Store information in embedded database.
        await insertDayOperations(listDayOperations);

        /* At this moment the final operations has been done, now it is needed to display the summarazie of all the day */
      } else {
        /* At the moment, there is not a default case */
      }
    } catch (error) {
      console.error('Something went wrong: ', error);
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
      {/* Depending on the action is that one menu or another one will be displayed. */}
      { isOperation ?
        <View style={tw`flex basis-3/6 w-full mt-3`}>
          <ScrollView horizontal={true}>
            <TableInventoryOperations
              suggestedInventory={suggestedProduct}
              currentInventory={currentInventory}
              operationInventory={inventory}
              setInventoryOperation={setInventory}
              currentOperation={currentOperation}/>
          </ScrollView>
        </View>
        :
        <TableInventoryVisualization
          inventory             = {productsInventory}
          suggestedInventory    = {suggestedProduct}
          initialInventory      = {initialShiftInventory}
          restockInventories    = {restockInventories}
          soldOperations        = {[]}
          repositionsOperations = {[]}
          returnedInventory     = {finalShiftInventory}
          inventoryWithdrawal   = {false}
          inventoryOutflow      = {false}
          finalOperation        = {false}
          issueInventory        = {false}/>
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
        <View style={tw`flex basis-1/6 w-full mt-3`}>
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
      <View style={tw`flex basis-1/6 mt-3`}>
        <VendorConfirmation
          onConfirm={isOperation ? handleVendorConfirmation : handlerReturnToRouteMenu}
          onCancel={handlerOnVendorCancelation}
          message={'Escribiendo mi numero de telefono y marcando el cuadro de texto acepto tomar estos productos.'}/>
      </View>
      <View style={tw`flex basis-1/6`}><Text> </Text></View>
    </ScrollView>
  );
};

export default InventoryOperationLayout;
