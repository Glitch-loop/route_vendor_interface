// Libraries
import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Checkbox } from 'react-native-paper';
import tw from 'twrnc';

// Components
import ConfirmationBand from './ConfirmationBand';

/*
  It is important to note that it is in this view where the user confirm the actions.
  It doesn't matter what type of inventory operation he is doing, in all the cases he
  is going to use this component to confirm (or sign) the operation that he is doing.
*/

const VendorConfirmation = ({
    message,
    onConfirm,
    onCancel,
  }:{
    message:string,
    onConfirm:any,
    onCancel:any,
  }) => {

  // Creating states
  const [checked, setChecked] = useState(false);

  return (
    <View
    style={tw`w-full flex flex-row justify-around items-center`}>
      <View style={tw`mx-3 flex flex-col`}>
        <Text style={tw`text-xl text-black`}>Nota:</Text>
        <Text style={tw`text-base text-black`}>{message}</Text>
        <View style={tw`mx-3 my-3 flex flex-row `}>
          <Checkbox
            status={checked ? 'checked' : 'unchecked'}
            onPress={() => {
              console.log("Accepting")
              console.log(!checked)

              setChecked(!checked);}}
            color="#6200ee"
            uncheckedColor="#666"/>
          <TextInput
            style={tw`h-10 w-3/4 
              border border-black rounded-lg px-4 bg-yellow-100 
              text-base text-black text-center`}
            placeholder="Numero teléfonico"
            />
        </View>
        <View style={tw`my-3 flex flex-row justify-around`}>
          <ConfirmationBand
              textOnAccept={'Aceptar'}
              textOnCancel={'Cancelar'}
              handleOnAccept={() => {onConfirm();}}
              handleOnCancel={() => {onCancel();}}
          />
        </View>
      </View>
    </View>
  );
};

export default VendorConfirmation;
