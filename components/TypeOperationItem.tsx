import React from "react";
import { Text, View } from "react-native";
import tw from 'twrnc';

const TypeOperationItem = () => {
  return (
    <View style={tw`w-11/12 flex flex-row justify-start items-center`}>
      <View style={tw`flex flex-row h-8 w-8 bg-green-400 rounded-full`} />
      <Text style={tw`ml-2 text-black flex flex-row items-center`}>Operacion</Text>
    </View>
  )
};



export default TypeOperationItem;
