

import React from 'react';
import { Text, Pressable } from 'react-native';
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
    <Pressable
      style={
        tw`px-2 py-1 h-8 ${style}
        rounded flex flex-row justify-center items-center
        border border-solid`}
      onPress={onClick}>
      <Text>{children}</Text>
    </Pressable>
  );
};


export default ActionButton;
