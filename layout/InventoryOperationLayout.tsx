import { View } from 'react-native';
import tw from 'twrnc';
import { ScrollView } from 'react-native';

import TableInventoryOperations from '../components/TableInventoryOperations';
import VendorConfirmation from '../components/VendorConfirmation';
import React from 'react';
import { Text } from 'react-native-paper';
import RouteHeader from '../components/RouteHeader';


const InventoryOperationLayout = ({navigation}) => {
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
          <TableInventoryOperations />
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
