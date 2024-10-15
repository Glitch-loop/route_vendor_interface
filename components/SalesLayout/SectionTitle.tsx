import React from 'react';
import { Text, View } from 'react-native';
import tw from 'twrnc';


const SectionTitle = ({
    title,
    caption,
    titlePositionStyle,
  }:{
    title:string,
    caption:string|undefined,
    titlePositionStyle:string
  }) => {
  return (
    <View style={tw`w-full flex flex-col ${titlePositionStyle}`}>
      <Text style={tw`flex text-black text-xl`}>{title}</Text>
      { (caption !== undefined && caption !== '') &&
        <Text style={tw`flex text-black text-sm`}>{caption}</Text>
      }
    </View>
  );
};

export default SectionTitle;
