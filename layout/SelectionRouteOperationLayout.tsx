import React from 'react';
import { Pressable, View, Text } from 'react-native';
import tw from 'twrnc';
import RouteHeader from '../components/RouteHeader';

const SelectionRouteOperationLayout = ({navigation}) => {
  
  return (
    <View style={tw`w-full h-full flex flex-col items-center`}>
      <RouteHeader
        routeName="Route 1"
        routeDay="Friday"
      />
      <View style={tw`w-full h-full flex flex-row items-center justify-center`}>
        <Pressable 
        style={tw`bg-indigo-300 mr-3 w-52 h-44 rounded-full flex flex-row justify-center items-center text-wrap max-w-44`}
        onPress={() => navigation.navigate('inventoryOperation')}>
          <Text style={tw`text-3xl text-center text-white`}>
            Auto-register of inventory
          </Text>
        </Pressable>
        <Pressable style={tw`bg-indigo-200 w-52 h-44 rounded-full flex flex-row justify-center items-center text-wrap max-w-44`}>
          <Text style={tw`text-3xl text-center text-white`}>
            Manager register of inventory
            </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SelectionRouteOperationLayout;
