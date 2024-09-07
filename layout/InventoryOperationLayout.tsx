// Libraries
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import tw from 'twrnc';

// Components
import RouteHeader from '../components/RouteHeader';
import TableInventoryOperations from '../components/TableInventoryOperations';
import VendorConfirmation from '../components/VendorConfirmation';

// Redux context
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { setProductInventory } from '../redux/slices/productsInventorySlice';

// Queries
import { getAllProducts } from '../queries/queries';

// Interfaces
import { ICurrency, IProductInventory } from '../interfaces/interfaces';
import MXN_CURRENCY from '../lib/mxnCurrency';
import TableCashReception from '../components/TableCashReception';


function initialMXNCurrencyState():ICurrency[] {
  let arrDenomination:ICurrency[] = [];

  for (const key in MXN_CURRENCY) {
    arrDenomination.push({
      id_denomination: parseInt(key,32),
      value: MXN_CURRENCY[key].value,
      amount: 0,
      coin: MXN_CURRENCY[key].coin,
    })
  }

  return arrDenomination;
}

const InventoryOperationLayout = ({ navigation }) => {
  // Setting redux context
  const dispatch: AppDispatch = useDispatch();
  const productsInventory = useSelector((state: RootState) => state.productsInventory);

  // Defining states
  const [inventory, setInventory] = useState<IProductInventory[]>([]);
  const [cashInventory, setCashInventory] = useState<ICurrency[]>(initialMXNCurrencyState());

  // Use effect operations
  useEffect(() => {
    // If true, it is needed to retrieve the products from database.
    if (productsInventory[0] === undefined) {
      getAllProducts().then(products => {
        // Initializing the inventory for all the products.
        let productInventory:IProductInventory[] = [];
        products.map(product => {
          productInventory.push({
            ...product,
            amount: 0,
          });

        });

        // Storing products state.
        dispatch(setProductInventory(productInventory));
        setInventory(productInventory);
      });
    }


  }, []);

  return (
    <ScrollView style={tw`w-full flex flex-col`}>
      <View style={tw`mt-3 w-full flex basis-1/6`}>
        <RouteHeader
          navigation={navigation}
          routeName="Route 1"
          routeDay="Friday"
          goTo="selectionRouteOperation"
        />
      </View>
      <View style={tw`flex basis-3/6 w-full mt-3`}>
        <Text style={tw`w-full text-center text-black text-2xl`}>Inventario</Text>
        <TableInventoryOperations
          inventoryOperation={inventory}
          setInventoryOperation={setInventory}
        />
      </View>
      <View style={tw`flex basis-1/6 w-full mt-3`}>
        <Text style={tw`w-full text-center text-black text-2xl`}>Dinero</Text>
        <TableCashReception
          cashInventoryOperation={cashInventory}
          setCashInventoryOperation={setCashInventory}
        />
      </View>
      <View style={tw`flex basis-1/6 mt-3`}>
        <VendorConfirmation
          navigation={navigation}
          goToConfirm={''}
          goToCancel={'selectionRouteOperation'}
          message={'Escribiendo mi numero de telefono y marcando el cuadro de texto acepto tomar estos productos.'}/>
      </View>
      <View style={tw`flex basis-1/6`}><Text> </Text></View>
    </ScrollView>
  );
};

export default InventoryOperationLayout;
