import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Checkbox } from 'react-native-paper';
import tw from 'twrnc';
import { ICurrency, IProductInventory } from '../interfaces/interfaces';

const VendorConfirmation = ({navigation,
  message,
  cashInventory,
  inventory,
  goToConfirm,
  goToCancel,
  }:{
  message:string,
  cashInventory:ICurrency[],
  inventory:IProductInventory[],
  goToConfirm:string,
  goToCancel:string}) => {
  const [checked, setChecked] = useState(false);

  const handleVendorConfirmation = ():void => {
    try {
      /*
        TODO:
         Save inventory state
         Save petty cash state
      */
      navigation.navigate(goToConfirm);
    } catch (error) {
      console.log("Something went wrong")
    }
  };

  return (
    <View
    style={tw`w-full flex flex-row justify-around items-center`}>
      <View style={tw`mx-3 flex flex-col`}>
        <Text style={tw`text-xl text-black`}>Nota:</Text>
        <Text style={tw`text-base text-black`}>{message}</Text>
        <View style={tw`mx-3 mt-3 flex flex-row `}>
          <Checkbox
            status={checked ? 'checked' : 'unchecked'}
            onPress={() => {
              setChecked(!checked);
            }}
            color="#6200ee"
            uncheckedColor="#666"/>
          <TextInput
            style={tw`h-10 w-3/4 
              border border-black rounded-lg px-4 bg-yellow-100 
              text-base text-black text-center`}
            // value={}
            placeholder="Numero teléfonico"
            />
        </View>
        <View style={tw`flex flex-row justify-around mt-3`}>
          <Pressable
            onPress={() => navigation.navigate(goToCancel)}
            style={tw`bg-orange-500 px-4 py-3 border border-black
            rounded flex flex-row justify-center border-solid`}>
            <Text>Cancelar</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              handleVendorConfirmation();
            }}
            style={tw`bg-green-500 px-4 py-3 
            border border-black rounded flex flex-row justify-center`}>
            <Text>confirmar</Text>
          </Pressable>
          </View>
      </View>
    </View>
  );
};

export default VendorConfirmation;
