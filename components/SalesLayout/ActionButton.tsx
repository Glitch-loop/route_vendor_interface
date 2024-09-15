

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';


const ActionButton = ({children, style}:{children:any, style:string}) => {

  return (
    // <View style={tw`flex flex-row justify-center items-center`}>
      <Pressable style={
        tw`px-2 py-1 h-8 ${style}
        rounded flex flex-row justify-center items-center
        border border-solid`}>
        <Text>{children}</Text>
      </Pressable>
    // </View>
  );
};

export default ActionButton;
