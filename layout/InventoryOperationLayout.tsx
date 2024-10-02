// Libraries
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
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

// Redux context
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { setDayGeneralInformation } from '../redux/slices/routeDaySlice';
import { setProductInventory } from '../redux/slices/productsInventorySlice';
import { setStores } from '../redux/slices/storesSlice';
import { setArrayDayOperations, setDayOperation, setNextOperation } from '../redux/slices/dayOperationsSlice';

// Moocks
import {
  productInventoryMoock,
  suggestedProductMoock,
  currentProductMoock,
} from '../moocks/productInventory';
import { determineRouteDayState } from '../utils/routeDayStoreStatesAutomata';
import { enumStoreStates } from '../interfaces/enumStoreStates';

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

  // Defining redux contexts
  const [inventory, setInventory] = useState<IProductInventory[]>([]);
  const [cashInventory, setCashInventory] = useState<ICurrency[]>(initialMXNCurrencyState());

  // Use effect operations
  useEffect(() => {
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
  }, []);

  // Handlers
  const handlerGoBack = () => {
    navigation.navigate('selectionRouteOperation');
  };

  const handleVendorConfirmation = async ():Promise<void> => {
    try {
      // Variables for different processes.
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
     if (startShiftInventory === -1) {
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
        // Store information in redux context.
        dispatch(setDayOperation(inventoryDayOperation));

        // Store information in embedded database.
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
        await insertDayOperations(dayOperationPlanification);

        /*
          At this point the records needed to start a database have been created.
          In the workflow of the application, the first operation has been completed (starting
          shift inventory), so it is needed to advance to the next operation (first store of
          the route).
        */
        dispatch(setNextOperation());
      }

      navigation.navigate('routeOperationMenu');
    } catch (error) {
      console.log(error)
      console.log('Something went wrong');
    }
  };

  const handlerOnVendorCancelation = () => {
    navigation.navigate('selectionRouteOperation');
  };


  return (
    <ScrollView style={tw`w-full flex flex-col`}>
      <View style={tw`mt-3 w-full flex basis-1/6`}>
        <RouteHeader
          onGoBack={handlerGoBack}/>
      </View>
      {/* Product inventory section. */}
      <View style={tw`flex basis-3/6 w-full mt-3`}>
        <Text style={tw`w-full text-center text-black text-2xl`}>Inventario</Text>
        <ScrollView horizontal={true}>
          <TableInventoryOperations
            suggestedInventory={suggestedProductMoock}
            currentInventory={currentProductMoock}
            operationInventory={inventory}
            enablingFinalInventory={true}
            setInventoryOperation={setInventory}/>
        </ScrollView>
      </View>
      {/* Cash reception section. */}
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
      <View style={tw`flex basis-1/6 mt-3`}>
        <VendorConfirmation
          onConfirm={handleVendorConfirmation}
          onCancel={handlerOnVendorCancelation}
          message={'Escribiendo mi numero de telefono y marcando el cuadro de texto acepto tomar estos productos.'}/>
      </View>
      <View style={tw`flex basis-1/6`}><Text> </Text></View>
    </ScrollView>
  );
};

export default InventoryOperationLayout;
