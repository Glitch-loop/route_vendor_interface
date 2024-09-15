import React from 'react';
import { Text, View } from 'react-native';
import tw from 'twrnc';


const SubtotalLine = ({
    description,
    total,
    fontStyle
  }:{
    description:string,
    total:string,
    fontStyle:string
  }) => {
  return (
    <View style={tw`w-11/12 flex flex-row justify-center items-center`}>
      <View style={tw`flex basis-5/6`}>
        <Text style={tw`text-black text-right ${fontStyle}`}>{description}</Text>
      </View>
      <View style={tw`flex basis-1/6`}>
        <Text style={tw`text-black text-center ${fontStyle}`}>${total}</Text>
      </View>
    </View>
  );
};

export default SubtotalLine;
