import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

const HeaderProduct = () => {
  return (
    <View style={tw`
      w-11/12 h-16
      bg-amber-200/75 border-solid border rounded-md
      flex flex-row justify-center items-center
      `}>
      <View style={tw`flex flex-row basis-2/6 justify-center`}>
        <Text style={tw`text-black`}>Producto</Text>
      </View>
      <View style={tw`flex flex-row basis-1/6 justify-center`}>
        <Text style={tw`text-black`}>Precio</Text>
      </View>
      <View style={tw`flex flex-row basis-2/6 justify-around items-center`}>
        <Text style={tw`text-black`}>Cantidad</Text>
      </View>
      <View style={tw`flex flex-row basis-1/6 justify-center mr-2`}>
        <Text style={tw`text-black`}>Subtotal</Text>
      </View>
    </View>
  );
};

export default HeaderProduct;
