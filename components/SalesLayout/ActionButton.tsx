

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';


const ActionButton = ({
  children,
  style,
  onClick,
  }:{
  children:any,
  style:string,
  onClick:any,
  }) => {

  return (
    // <View style={tw`flex flex-row justify-center items-center`}>
      <Pressable
        style={
          tw`px-2 py-1 h-8 ${style}
          rounded flex flex-row justify-center items-center
          border border-solid`}
        onPress={onClick}>
        <Text>{children}</Text>
      </Pressable>
    // </View>
  );
};

export default ActionButton;
