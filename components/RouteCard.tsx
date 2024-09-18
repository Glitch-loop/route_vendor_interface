// Libraries
import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

// Components
import GoButton from './generalComponents/GoButton';


const RouteCard = (
  {
    itemOrder,
    itemName,
    description,
    totalValue,
    style,
    onSelectItem,
  }:
  {
    itemOrder:string,
    itemName:string,
    description:string,
    totalValue:string,
    style:string,
    onSelectItem:any
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
        <View style={tw`w-full flex basis-1/6 flex-row justify-center items-center`}>
          <GoButton
            iconName={'chevron-right'}
            onPressButton={onSelectItem}/>
        </View>
      </View>
    );
  };

export default RouteCard;
