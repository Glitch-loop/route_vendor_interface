import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';
import { standard_format } from '../utils/moment_format';

const RouteHeader = (
  {navigation, routeName, routeDay, goTo}:
  {routeName:string, routeDay:string, goTo:string}) => {
    
  return (
    <View style={tw`w-full flex flex-row justify-around text-center items-center`}>
      <Pressable
        style={tw`bg-blue-700 px-4 py-3 rounded-full flex flex-row justify-center`}
        onPress={() => navigation.navigate(goTo)}>
        <Icon name="chevron-left" style={tw`text-base text-center`} color="#fff" />
      </Pressable>
      <Text style={tw`text-3xl text-black`}>{routeName}</Text>
      <Text style={tw`text-2xl text-black`}>|</Text>
      <View style={tw`flex flex-col`}>
        <Text style={tw`text-base text-black text-center`}>{standard_format()}</Text>
        <Text style={tw`text-base text-black text-center`}>{routeDay}</Text>
      </View>
    </View>
  );
};

export default RouteHeader;
