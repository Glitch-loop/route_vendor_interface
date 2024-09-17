// Libraries
import React from 'react';
import { View, Pressable, Text } from 'react-native';
import tw from 'twrnc';

const ConfirmationBand = ({
  textOnAccept,
  textOnCancel,
  handleOnAccept,
  handleOnCancel,
}:{
  textOnAccept:string,
  textOnCancel:string,
  handleOnAccept:any,
  handleOnCancel:any,
}) => {
  return (
    <View style={tw`flex flex-row justify-around`}>
      <Pressable style={
        tw`bg-orange-500 h-14 max-w-32 border border-solid rounded
        flex flex-row basis-1/2  justify-center items-center`}
        onPress={() => {handleOnCancel();}}>
        <Text style={tw`text-center text-black`}>{textOnCancel}</Text>
      </Pressable>
      <Pressable style={
        tw`bg-green-500 h-14 max-w-32 border border-solid rounded
        flex flex-row basis-1/2 justify-center items-center`}
        onPress={() => {handleOnAccept();}}>
        <Text style={tw`text-center text-black`}>{textOnAccept}</Text>
      </Pressable>
    </View>
  );
};


export default ConfirmationBand;
