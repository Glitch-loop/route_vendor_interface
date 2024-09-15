import React from 'react';
import { View, Text, TextInput } from 'react-native';
import tw from 'twrnc';
import ActionButton from './ActionButton';
import Icon from 'react-native-vector-icons/FontAwesome';

const CardProduct = ({
    productName,
    price,
    amount,
    subtotal,
  }:{
    productName:string,
    price:string,
    amount:string,
    subtotal:string,
  }) => {

  return (
    <View style={tw`
      w-11/12 h-16
      bg-amber-200/75 border-solid border rounded-md
      flex flex-row justify-center items-center
      `}>
      <View style={tw`flex flex-row basis-2/6 justify-center`}>
        <Text style={tw`text-black`}>{productName}</Text>
      </View>
      <View style={tw`flex flex-row basis-1/6 justify-center`}>
        <Text style={tw`text-black`}>${price}</Text>
      </View>
      <View style={tw`flex flex-row basis-2/6 justify-around items-center`}>
        <ActionButton style={'bg-red-600'}>
          <Icon name="minus" style={tw`text-base text-center`} color="#000"/>
        </ActionButton>
        <TextInput
          style={tw`mx-1 border border-solid bg-white rounded-md h-10 text-center`}
          />
        <ActionButton style={'bg-blue-700'}>
          <Icon name="plus" style={tw`text-base text-center`} color="#000"/>
        </ActionButton>
      </View>
      <View style={tw`flex flex-row basis-1/6 justify-center`}>
        <Text style={tw`text-black`}>${subtotal}</Text>
      </View>
    </View>
  )
};

export default CardProduct;
