// Libraries
import React from 'react';
import { Pressable, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';

// 
import { getPrinterBluetoothConnction, printTicketBluetooth } from '../../services/printerService';

const BluetoothButton = ({}:{}) => {
  return (
    <View>
      <Pressable
        style={tw`bg-blue-700 py-6 px-6 rounded-full`}
        onPress={() => {}}>
        <Icon name={'print'}
          style={tw`absolute inset-0 top-3 text-base text-center`} color="#fff" />
      </Pressable>
        <View style={tw`absolute top-0 right-8 bg-red-700 py-3 px-3 rounded-full`} />
        {/* <View style={tw`absolute top-0 right-8 bg-green-500 py-3 px-3 rounded-full`} /> */}

        {/* <View style={tw`absolute top-0 right-8 bg-yellow-300 py-3 px-3 rounded-full`} /> */}
        {/* <ActivityIndicator style={tw`absolute top-0 right-8`}/> */}
    </View>
  );
};

export default BluetoothButton;
