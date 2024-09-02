import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import tw from 'twrnc';
import RouteHeader from "../components/RouteHeader";

const SelectionRouteOperationLayout = ({navigation}) => {
  
  return (
    <View style={tw`w-full h-full flex flex-col items-center`}>
      <RouteHeader
        routeName="Route 1"
        routeDay="Friday"
      />
      <Text>Hello world</Text>
    </View>
  );
};

export default SelectionRouteOperationLayout;