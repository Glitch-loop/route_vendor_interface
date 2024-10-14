// Libraries
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, BackHandler } from 'react-native';
import 'react-native-get-random-values'; // Necessary for uuid
import {v4 as uuidv4 } from 'uuid';
import tw from 'twrnc';

// Components
import RouteHeader from '../components/RouteHeader';
import TableInventoryOperations from '../components/TableInventoryOperations';
import VendorConfirmation from '../components/VendorConfirmation';

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
import MXN_CURRENCY from '../lib/mxnCurrency';
import TableCashReception from '../components/TableCashReception';
import { timestamp_format } from '../utils/momentFormat';
import { planningRouteDayOperations } from '../utils/routesFunctions';
import { determineRouteDayState } from '../utils/routeDayStoreStatesAutomata';
import { enumStoreStates } from '../interfaces/enumStoreStates';

// Redux context
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { setDayGeneralInformation } from '../redux/slices/routeDaySlice';
import { addProductsInventory, setProductInventory } from '../redux/slices/productsInventorySlice';
import { setStores } from '../redux/slices/storesSlice';
import { setArrayDayOperations, setDayOperation, setDayOperationBeforeCurrentOpeation, setNextOperation } from '../redux/slices/dayOperationsSlice';

// Moocks
import {
  productInventoryMoock,
  suggestedProductMoock,
  currentProductMoock,
} from '../moocks/productInventory';
import TableInventoryVisualization from '../components/InventoryComponents/TableInventoryVisualization';

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

function initialMXNCurrencyState():ICurrency[] {
  let arrDenomination:ICurrency[] = [];

  for (const key in MXN_CURRENCY) {
    arrDenomination.push({
      id_denomination: parseInt(key,32),
      value: MXN_CURRENCY[key].value,
      amount: 0,
      coin: MXN_CURRENCY[key].coin,
    });
  }

  return arrDenomination;
}

const InventoryOperationLayout = ({ navigation }:{ navigation:any }) => {
  // Defining redux context
  const dispatch: AppDispatch = useDispatch();
  const productsInventory = useSelector((state: RootState) => state.productsInventory);
  const dayOperations = useSelector((state: RootState) => state.dayOperations);
  const routeDay = useSelector((state: RootState) => state.routeDay);
  const currentOperation = useSelector((state: RootState) => state.currentOperation);

  // Defining states
  const [isFirstInventory, setIsFirstInventory] = useState<boolean>(false);

  /* The state of 'inventory' is which will store all the modification during the product operation*/
  const [inventory, setInventory] = useState<IProductInventory[]>([]);
  const [cashInventory, setCashInventory] = useState<ICurrency[]>(initialMXNCurrencyState());

  /*
    Suggested product is a special state that uses, at the moment, initial inventory operation, providing
    information about the idoneal amount of product to carry for beginning the route.
  */
  const [suggestedProduct, setSuggestedProduct] = useState<IProductInventory[]>([]);

  /*
    current product state is used to store the current inventory (current inventory at the moment of 
    making the inventory operation).
  */
  const [currentProduct, setCurrentProduct] = useState<IProductInventory[]>([]);

  /*
    States used for inventory oepration vizualization.
  */
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

    getAllProducts().then(products => {
      // Creating inventory for all the products.
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
      setCurrentProduct([]);
      setInventory([]);
      setIsOperation(false);
      setIsFirstInventory(false);

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

    } else { // It is a new operation
      /* It means it is a product operation */
      if (currentOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory) {
        /*
          It means that it is a restock menu.
          This is an operation which previously has been other inventory operations.

          So, the vendor currently has prouct.
        */
        if (productsInventory.length === 0) {
          // Something happened with the information, so it is needed to consult to the embedded database.
          getProducts()
          .then((storedProductsInventory) => {
            setCurrentProduct(storedProductsInventory);
          })
          .catch(() => {
            setCurrentProduct([]);
          });
        } else {
          setCurrentProduct(productsInventory);
        }

        setIsFirstInventory(false);
      } else {
        /* It is a initial shift inventory operation */
        /*
          Since it is the first inventory operation and the state
          'inventory' stores an inventory in blank, we can copy this inventory
          in currentProduct.
        */
        setIsFirstInventory(true);
        setCurrentProduct(inventory);
      }
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

  const handleVendorConfirmation = async ():Promise<void> => {
    try {
      /* Avoiding re-executions in case of inventory */
      if (isInventoryAccepted === true) {
        return;
      }

      setIsInventoryAccepted(true);

      // Variables for different processes.
      // const workDay:IRoute&IDayGeneralInformation&IDay&IRouteDay = {
      //   /*Fields related to the general information.*/
      //   id_work_day: '',
      //   start_date: '',
      //   finish_date: '',
      //   start_petty_cash: 0,
      //   final_petty_cash: 0,
      //   /*Fields related to IRoute interface*/
      //   id_route: '',
      //   route_name: '',
      //   description: '',
      //   route_status: '',
      //   id_vendor: '',
      //   /*Fields related to IDay interface*/
      //   id_day: '',
      //   day_name: '',
      //   order_to_show: 0,
      //   /*Fields relate to IRouteDay*/
      //   id_route_day: '',
      // };

      const dayGeneralInformation:IDayGeneralInformation = {
        id_work_day: '',
        start_date : timestamp_format(),
        finish_date: timestamp_format(),
        start_petty_cash: 0,
        final_petty_cash: 0,
      };

      const inventoryDayOperation:IDayOperation = {
        id_day_operation: '',
        id_item: '', //At this point the inventory hasn't been created.
        id_type_operation: '',
        operation_order: 0,
        current_operation: 0,
      };

      const dayOperationPlanification:IDayOperation[] = [];

      const startShiftInventory = dayOperations.findIndex(dayOperation => {
        return dayOperation.id_type_operation === DAYS_OPERATIONS.start_shift_inventory;
      });

      const storesInTheRoute:IRouteDayStores[] = [];
      const stores:(IStore&IStoreStatusDay)[] = [];

      const inventoryOperation:IInventoryOperation = {
        id_inventory_operation: '',
        sign_confirmation: '',
        date: '',
        audit: 0,
        id_type_of_operation: '',
        id_work_day: '',
      };

      const inventoryOperationDescription:IInventoryOperationDescription[] = [];

      const newInventory:IProductInventory[] = [];

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
     if (startShiftInventory === -1) { // It is a start shift inventory operation
        /*
          When the vendor selected the route that is going to perform today, all of these
          were recorded:
            - route
            - day
            - routeDay

          So, it is just needed to complete the remainded information.
            - General information related to the route.

          Conceptually, after aceppting the initial inventory, he accepts to make the route with
          certain amount of product.
        */

        // General information about the route.
        // Setting general information related to the route.
        dayGeneralInformation.id_work_day = uuidv4();
        dayGeneralInformation.start_date = timestamp_format();
        dayGeneralInformation.finish_date = timestamp_format();
        // Getting the total of money that he is carrying.
        dayGeneralInformation.start_petty_cash = cashInventory
        .reduce((acc, currentCurrency) => { if (currentCurrency.amount === undefined) {return acc;}
          else {return acc + currentCurrency.amount * currentCurrency.value;}}, 0);
        dayGeneralInformation.final_petty_cash = 0;

        /*
          According with the flow of the business operation, after selecting the route,
          the vendor must make an "start_shift_inventory operation" to have products for selling.
          So, the next operation (after selecting the route) is make the inventory.
        */

        // Creating the inventory operation (this inventory operation is tied to the "work day").
        inventoryOperation.id_inventory_operation = uuidv4();
        inventoryOperation.sign_confirmation = '1';
        inventoryOperation.date = timestamp_format();
        inventoryOperation.audit = 0;
        inventoryOperation.id_type_of_operation = DAYS_OPERATIONS.start_shift_inventory;
        inventoryOperation.id_work_day = dayGeneralInformation.id_work_day;

        // Creating a day operation (day operation resulted from the ivnentory operation).
        inventoryDayOperation.id_day_operation = uuidv4();
        inventoryDayOperation.id_item = inventoryOperation.id_inventory_operation;
        inventoryDayOperation.id_type_operation = DAYS_OPERATIONS.start_shift_inventory;
        inventoryDayOperation.operation_order = 0;
        inventoryDayOperation.current_operation = 1;

        // General information about the route
        // Storing information in redux context.
        dispatch(setDayGeneralInformation(dayGeneralInformation));

        // Storing information in embedded database.
        await insertWorkDay({...dayGeneralInformation, ...routeDay});

        // Inventory operation.
        /*
          In theory, this information should be stored in both redux state and embedded database
          but since it is information with low read operations, to prevent making the application
          heavy the information is only stored in the embedded database.
        */
        // Storing information in embedded database.
        await insertInventoryOperation(inventoryOperation);

        //Inventory operation description.
        /*
          This is a sub-record of the inventory description. This table contains the "movements"
          or actions that were made in the inventiry operation... Essentially: product, amount of
          product.
        */
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

        // Storing information in embedded database.
        await insertInventoryOperationDescription(inventoryOperationDescription);


        // Inventory
        /*
          Since this is the first inventory operation, the product that is going to be stored
          will be the inventory.
        */
        // Storing information in redux context.
        dispatch(setProductInventory(inventory));

        // Storing information in embedded database.
        await insertProducts(inventory);

        // Day operation.
        /*
          Once all the process have been stored, the day operation itself is created.
        */
       console.log("Inserting a new operation: ", inventoryDayOperation)
        // Store information in redux context.
        dispatch(setDayOperation(inventoryDayOperation));

        // Store information in embedded database.
        // Start shift inventory is not longer the current activity.
        inventoryDayOperation.current_operation = 0;
        await insertDayOperation(inventoryDayOperation);

        // Stores.
        //Setting information of the stores.
        // Getting the stores that belongs to a particular day of the route
        (await getAllStoresInARouteDay(routeDay.id_route_day))
        .forEach((storeInRouteDay) => {storesInTheRoute.push(storeInRouteDay);});

        // Getting the information of the stores that belongs to this work day.
        (await getStoresByArrID(storesInTheRoute
          .map(storeInRoute => {return storeInRoute.id_store;})))
          .map((storeInformation) => stores.push({
            ...storeInformation,
            route_day_state: determineRouteDayState(enumStoreStates.NUETRAL_STATE, 1),
          }));

        // Storing in redux context.
        dispatch(setStores(stores));

        // Storing in embedded database
        await insertStores(stores);

        //Setting route operations (the stores that are going to be visited during the day).
        planningRouteDayOperations(storesInTheRoute)
          .forEach((dayOperation:IDayOperation) =>
            { dayOperationPlanification.push(dayOperation); });

        // Storing in redux state.
        dispatch(setArrayDayOperations(dayOperationPlanification));

        // Storing in embedded database
        if (dayOperationPlanification.length > 0) {
          // Updating the first store of the route is the new current operation. 
          dayOperationPlanification[0].current_operation = 1;
        }

        await insertDayOperations(dayOperationPlanification);

        /*
          At this point the records needed to start a database have been created.
          In the workflow of the application, the first operation has been completed (starting
          shift inventory), so it is needed to advance to the next operation (first store of
          the route).
        */
        dispatch(setNextOperation());
      } else {
        if(currentOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory) {
          // It is a re-stock operation
          // Creating the inventory operation (this inventory operation is tied to the "work day").
          inventoryOperation.id_inventory_operation = uuidv4();
          inventoryOperation.sign_confirmation = '1';
          inventoryOperation.date = timestamp_format();
          inventoryOperation.audit = 0;
          inventoryOperation.id_type_of_operation = DAYS_OPERATIONS.restock_inventory;
          inventoryOperation.id_work_day = routeDay.id_work_day;

          // Creating a day operation (day operation resulted from the ivnentory operation).
          inventoryDayOperation.id_day_operation = uuidv4();
          inventoryDayOperation.id_item = inventoryOperation.id_inventory_operation;
          inventoryDayOperation.id_type_operation = DAYS_OPERATIONS.restock_inventory;
          inventoryDayOperation.operation_order = 0;
          inventoryDayOperation.current_operation = 0;

          // Storing information in embedded database.
          await insertInventoryOperation(inventoryOperation);

          //Inventory operation description.
          /*
            This is a sub-record of the inventory description. This table contains the "movements"
            or actions that were made in the inventiry operation... Essentially: product, amount of
            product.
          */
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

          // Storing information in embedded database.
          await insertInventoryOperationDescription(inventoryOperationDescription);

          // Inventory
          /*
            Since it is a re-stock operation, it is just needed to:
              - Update the productInventory
              - Update the day operation
          */
          // Storing information in redux context.
          dispatch(addProductsInventory(inventory));

          //Calculating the new product inventory
          /*
            Note: Remember that from the a product inventory operation
            there is 2 'items' to be stored.

            - The operation itself (how many product the vendor is carrying or returning)
            - And the updated inventory, bascially the current product amount + inventory operation amount.
          */
          currentProduct.forEach((currentProductUpdate) => {
            const productFound:undefined|IProductInventory = inventory
              .find(productInventory => productInventory.id_product === currentProductUpdate.id_product);

              if (productFound !== undefined) {
                newInventory.push({
                  ...productFound,
                  amount: currentProductUpdate.amount + productFound.amount,
                });
              }
          });

          // Storing information in embedded database.
          await updateProducts(newInventory);

          // Day operations.
          /*
            Once all the processes have been stored, the day operation itself is created.

            There are two options:
             - Instert the specific item at the middle of the day operations list.
             - Delete and instert all the day operations, respecting the current information, with the differente of
             place the new operation in the position that correspond.

            Since it is expected that at the day as maximum a vendor can make 100 day operations, and that it might be prone to error
            the fact of updating the information, it was chosen the second option.
          */
          const index = dayOperations.findIndex(operationDay => operationDay.current_operation === 1);

          dayOperations.forEach(dayOperation => {
            dayOperationPlanification.push(dayOperation);
          });

          if (index === -1) {
            /* If there is no current operation, append the new operation to the end of the list. */
            dayOperationPlanification.push(inventoryDayOperation);
          } else {
            /* Insert the new operation before the current operation. */
           dayOperationPlanification.splice(index, 0, inventoryDayOperation);
          }

          // Store information in redux context.
          dispatch(setDayOperationBeforeCurrentOpeation(inventoryDayOperation));

          // Delete all the information from the database.
          await deleteAllDayOperations();

          // Store information in embedded database.
          await insertDayOperations(dayOperationPlanification);
        }
      }

      navigation.reset({
        index: 0, // Set the index of the new state (0 means first screen)
        routes: [{ name: 'routeOperationMenu' }], // Array of route objects, with the route to navigate to
      });
      navigation.navigate('routeOperationMenu');

    } catch (error) {
      console.error('Something went wrong: ', error);
      setIsInventoryAccepted(false);
    }
  };

  const handlerOnVendorCancelation = () => {
    navigation.navigate('selectionRouteOperation');
  };

  const handlerReturnToRouteMenu = async ():Promise<void> => {
    navigation.navigate('routeOperationMenu');
  };

  return (
    <ScrollView style={tw`w-full flex flex-col`}>
      <View style={tw`mt-3 w-full flex basis-1/6`}>
        <RouteHeader
          onGoBack={handlerGoBack}/>
      </View>
      {/* Product inventory section. */}
      <Text style={tw`w-full text-center text-black text-2xl`}>Inventario</Text>
      {/* Depending on the action is that one menu or another one will be displayed. */}
      { isOperation ?
        <View style={tw`flex basis-3/6 w-full mt-3`}>
          <ScrollView horizontal={true}>
            <TableInventoryOperations
              suggestedInventory={suggestedProduct}
              currentInventory={currentProduct}
              operationInventory={inventory}
              setInventoryOperation={setInventory}/>
          </ScrollView>
        </View> :
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
      { currentOperation.id_type_operation !== DAYS_OPERATIONS.restock_inventory && isOperation &&
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
          onCancel={isFirstInventory ? handlerOnVendorCancelation : handlerReturnToRouteMenu}
          message={'Escribiendo mi numero de telefono y marcando el cuadro de texto acepto tomar estos productos.'}/>
      </View>
      <View style={tw`flex basis-1/6`}><Text> </Text></View>
    </ScrollView>
  );
};

export default InventoryOperationLayout;
