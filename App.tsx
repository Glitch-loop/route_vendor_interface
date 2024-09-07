/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {} from 'react';
import { View } from 'react-native';

import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Provider } from 'react-redux';
import store from './redux/store';

import RouteSelectionLayout from './layout/RouteSelectionLayout';
import SelectionRouteOperationLayout from './layout/SelectionRouteOperationLayout';
import InventoryOperationLayout from './layout/InventoryOperationLayout';
import tw from 'twrnc';

export type RootStackParamList = {
  routeSelection: undefined;
  selectionRouteOperation: undefined;
  inventoryOperation: undefined;
  // counterScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <PaperProvider>
          <View style={tw`w-full h-full`}>
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
            </Stack.Navigator>
          </View>
        </PaperProvider>
      </NavigationContainer>
    </Provider>
  );
}
export default App;
