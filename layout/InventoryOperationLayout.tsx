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
import {
  getAllProducts,
  getAllStoresInARouteDay,
  getStoresByArrID,
} from '../queries/queries';


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
 } from '../interfaces/interfaces';

// Utils
import DAYS_OPERATIONS from '../lib/day_operations';
import MXN_CURRENCY from '../lib/mxnCurrency';
import TableCashReception from '../components/TableCashReception';
import { timesamp_standard_format } from '../utils/momentFormat';
import { planningRouteDayOperations } from '../utils/routesFunctions';

// Redux context
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { setDayGeneralInformation } from '../redux/slices/routeDaySlice';
import { setProductInventory } from '../redux/slices/productsInventorySlice';
import { setStores } from '../redux/slices/storesSlice';
import { setArrayDayOperations, setNextOperation } from '../redux/slices/dayOperationsSlice';

// Moocks
import {
  productInventoryMoock,
  suggestedProductMoock,
  currentProductMoock,
} from '../moocks/productInventory';
import { insertProducts, insertWorkDay } from '../queries/SQLite/sqlLiteQueries';

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
        id_work_day: "",
        start_date : timesamp_standard_format(),
        finish_date: timesamp_standard_format(),
        start_petty_cash: 0,
        final_petty_cash: 0,
      }

      //Setting information related to the route that is going to be performed today.
      if (DAYS_OPERATIONS.start_shift_inventory === dayOperations[dayOperations.length - 1].id_type_operation) {
        /*
          At this point:
            - route
            - day
            - routeDay
          information is already covered, this information was provided at the moment of
          selecting a route

          So, it is just needed to complete the remainded information.

          At this moment, the vendor defined the route that is going to make today.
        */

       // It is assigned an ID because the vendor already defined the route to make today.
        dayGeneralInformation.id_work_day = uuidv4();
        dayGeneralInformation.start_date = timesamp_standard_format();
        dayGeneralInformation.finish_date = timesamp_standard_format();
        dayGeneralInformation.start_petty_cash = cashInventory.reduce((acc, currentCurrency) => {
          if (currentCurrency.amount === undefined) {return acc;}
          else {return acc + currentCurrency.amount * currentCurrency.value;}
        }, 0);
        dayGeneralInformation.final_petty_cash = 0;

        // Setting general information related to the route.
        // Storing information in redux context.
        dispatch(setDayGeneralInformation(dayGeneralInformation));

        // Storing information in embedded database.
        insertWorkDay({...dayGeneralInformation, ...routeDay});

        //Setting initial inventory.
        // Storgin information in redux context.
        dispatch(setProductInventory(inventory));

        // Storing information in embedded database.
        insertProducts(inventory);

        // Getting the stores that belongs to a particular day of the route
        const storesInTheRoute:IRouteDayStores[] = await getAllStoresInARouteDay(routeDay.id_route_day);

        // Getting the information of the stores that belongs to this work day.
        const stores:IStore[] =
          await getStoresByArrID(storesInTheRoute.map(store => {return store.id_store;}));

        //Setting information of the stores.
        dispatch(setStores(stores));

        //Setting route operation.
        dispatch(setArrayDayOperations(planningRouteDayOperations(storesInTheRoute)));

        //Setting to the first operation
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
