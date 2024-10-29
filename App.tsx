/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
// Libraries
import React, {useEffect} from 'react';
import { AppRegistry, View } from 'react-native';
import tw from 'twrnc';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Redux context
import { Provider } from 'react-redux';
import store from './redux/store';

// Layouts
import RouteSelectionLayout from './layout/RouteSelectionLayout';
import SelectionRouteOperationLayout from './layout/SelectionRouteOperationLayout';
import InventoryOperationLayout from './layout/InventoryOperationLayout';
import RouteOperationMenuLayout from './layout/RouteOperationMenuLayout';
import StoreMenuLayout from './layout/StoreMenuLayout';
import SalesLayout from './layout/SalesLayout';
import ToastMessage from './components/generalComponents/ToastMessage';


// Embedded database
// Queries
import {
  createEmbeddedDatabase,
  dropEmbeddedDatabase,
 } from './queries/SQLite/sqlLiteQueries';

// Services
import { getPrinterBluetoothConnection } from './services/printerService';

import { requestGeolocalizationPermissionsProcess } from './services/geolocationService';

export type RootStackParamList = {
  routeSelection: undefined;
  selectionRouteOperation: undefined;
  inventoryOperation: undefined;
  routeOperationMenu: undefined;
  storeMenu: undefined;
  sales: undefined;
};


/*
  TODO: Place the database initilization at the beginning of the program
*/


async function databaseInitialization() {
  try {
    // Dropping database
    // await dropEmbeddedDatabase();

    // Creating database
    await createEmbeddedDatabase();


    // Verifying permissions
    // Connecting to the printer
    //await getPrinterBluetoothConnection();

    // Geolocalization permissions
    await requestGeolocalizationPermissionsProcess();

  } catch (error) {
    console.log('Error: ', error);
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  useEffect(() => {
    // Initializing database
    databaseInitialization();
  });


  return (
    <Provider store={store}>
      <NavigationContainer>
        <PaperProvider>
          <View style={tw`w-full h-full`}>
            <ToastMessage />
            {/* <Stack.Navigator initialRouteName="inventoryOperation"> */}
            <Stack.Navigator initialRouteName="routeSelection">
              <Stack.Screen
                name="routeSelection"
                component={RouteSelectionLayout}
                options={{ headerShown: false}}/>
              <Stack.Screen
                name="selectionRouteOperation"
                component={SelectionRouteOperationLayout}
                options={{ headerShown: false}}/>
              <Stack.Screen
                name="inventoryOperation"
                component={InventoryOperationLayout}
                options={{  headerShown: false }} />
              <Stack.Screen
                name="routeOperationMenu"
                component={RouteOperationMenuLayout}
                options={{  headerShown: false }} />
              <Stack.Screen
                name="storeMenu"
                component={StoreMenuLayout}
                options={{  headerShown: false }} />
              <Stack.Screen
                name="sales"
                component={SalesLayout}
                options={{  headerShown: false }} />
            </Stack.Navigator>
          </View>
        </PaperProvider>
      </NavigationContainer>
    </Provider>
  );
}
export default App;
