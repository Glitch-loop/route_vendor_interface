import React from 'react';
import { Pressable } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';

const DangerButton = ({iconName, onPressButton}:{iconName:string, onPressButton:any}) => {
  return (
    <Pressable
      style={tw`bg-red-500 py-6 px-6 rounded-full`}
      onPress={() => {onPressButton();}}>
      <Icon name={iconName}
        style={tw`absolute inset-0 top-3 text-base text-center`} color="#fff" />
    </Pressable>
  );
};

export default DangerButton;
