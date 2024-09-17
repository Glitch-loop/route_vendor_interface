/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
// Libraries
import React, {} from 'react';
import { View } from 'react-native';
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
import ResultSaleLayout from './layout/ResultSaleLayout';

export type RootStackParamList = {
  routeSelection: undefined;
  selectionRouteOperation: undefined;
  inventoryOperation: undefined;
  routeOperationMenu: undefined;
  storeMenu: undefined;
  sales: undefined;
  resultSales: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <PaperProvider>
          <View style={tw`w-full h-full`}>
            {/* <Stack.Navigator initialRouteName="resultSales"> */}
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
              <Stack.Screen
                name="resultSales"
                component={ResultSaleLayout}
                options={{  headerShown: false }} />
            </Stack.Navigator>
          </View>
        </PaperProvider>
      </NavigationContainer>
    </Provider>
  );
}
export default App;
