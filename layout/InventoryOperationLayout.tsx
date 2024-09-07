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
import { IProductInventory } from '../interfaces/interfaces';

const InventoryOperationLayout = ({ navigation }) => {
  // Setting redux context
  const dispatch: AppDispatch = useDispatch();
  const productsInventory = useSelector((state: RootState) => state.productsInventory);

  // Defining states
  const [inventory, setInventory] = useState<IProductInventory[]>([]);

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
        <View style={tw`flex basis-3/6 w-full`}>
          <TableInventoryOperations
            inventoryOperation={inventory}
            setInventoryOperation={setInventory}
          />
        </View>
        <View style={tw`flex basis-1/5`}>
          <VendorConfirmation
            navigation={navigation}
            goToConfirm={''}
            goToCancel={'selectionRouteOperation'}
            message={'Escribiendo mi numero de telefono y marcando el cuadro de texto acepto tomar estos productos.'}/>
        </View>
        <View style={tw`flex basis-1/5`}><Text> </Text></View>
    </ScrollView>
  );
};

export default InventoryOperationLayout;
