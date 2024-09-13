import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';

const RouteCard = (
  {
    navigation,
    goTo,
    itemOrder,
    itemName,
    description,
    totalValue,
    style,
  }:
  {
    navigation:any,
    goTo:string,
    itemOrder:string,
    itemName:string,
    description:string,
    totalValue:string,
    style:string,
  }) => {

    return (
      <View style={
        tw`${style}`}>
        <View style={tw`flex basis-1/6 flex-col`}>
          <Text style={tw`text-black text-lg text-center`}>{itemOrder}</Text>
        </View>
        { description ?
          <View style={tw`flex basis-3/6 flex-col justify-center`}>
            <Text style={tw`text-black text-lg`} numberOfLines={1} ellipsizeMode="head">
              {itemName}
            </Text>
            <Text style={tw`text-black text-xs`}>{description}</Text>
          </View> :
          <View style={tw`flex basis-3/6 flex-col justify-center`}>
            <Text style={tw`text-black text-lg`}>{itemName}</Text>
          </View>
        }
        <View style={tw`flex basis-1/6 flex-col justify-center`}>
          {totalValue &&
            <Text style={tw`text-black text-lg`}>
              ${totalValue}
            </Text>
          }
        </View>
        <View style={tw`w-full flex basis-1/6 flex-row justify-center`}>
          {/* <View style={tw`flex flex-row justify-center w-full`}> */}
            <Pressable
            style={tw`
              bg-blue-700 py-4 rounded-full 
              flex basis-4/5 flex-row justify-center items-center`}
            onPress={() => {
              navigation.navigate(goTo);
              }}>
              <Icon name="chevron-right" style={tw`text-base text-center`} color="#fff" />
            </Pressable>
          {/* </View> */}
        </View>
      </View>
    );
  };

export default RouteCard;
