// Libraries
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import tw from 'twrnc';

// Components
import RouteHeader from '../components/RouteHeader';
import TableInventoryOperations from '../components/TableInventoryOperations';
import VendorConfirmation from '../components/VendorConfirmation';

// Queries
import { getAllProducts } from '../queries/queries';

// Interfaces
import { ICurrency, IProductInventory } from '../interfaces/interfaces';
import MXN_CURRENCY from '../lib/mxnCurrency';
import TableCashReception from '../components/TableCashReception';

// Redux context
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';


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
  // Setting redux context
  const productsInventory = useSelector((state: RootState) => state.productsInventory);

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



  return (
    <ScrollView style={tw`w-full flex flex-col`}>
      <View style={tw`mt-3 w-full flex basis-1/6`}>
        <RouteHeader
          onGoBack={handlerGoBack}/>
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
        <Text style={tw`w-full text-center text-black text-xl mt-2`}>
          Total:
          ${cashInventory.reduce((accumulator, denomination) => {
              return accumulator + denomination.amount! * denomination.value;},0)}
          </Text>
      </View>
      <View style={tw`flex basis-1/6 mt-3`}>
        <VendorConfirmation
          navigation={navigation}
          cashInventory={cashInventory}
          inventory={inventory}
          goToConfirm={'routeOperationMenu'}
          goToCancel={'selectionRouteOperation'}
          message={'Escribiendo mi numero de telefono y marcando el cuadro de texto acepto tomar estos productos.'}/>
      </View>
      <View style={tw`flex basis-1/6`}><Text> </Text></View>
    </ScrollView>
  );
};

export default InventoryOperationLayout;
