// Libraries
import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import tw from 'twrnc';

// Components
import ConfirmationBand from './ConfirmationBand';
import Toast from 'react-native-toast-message';

/*
  It is important to note that it is in this view where the user confirm the actions.
  It doesn't matter what type of inventory operation he is doing, in all the cases he
  is going to use this component to confirm (or sign) the operation that he is doing.
*/

const VendorConfirmation = ({
    message,
    onConfirm,
    onCancel,
    confirmMessageButton = 'Aceptar',
    cancelMessageButton = 'Cancelar',
    requiredValidation = true,
  }:{
    message:string,
    onConfirm:any,
    onCancel:any,
    confirmMessageButton:string,
    cancelMessageButton:string,
    requiredValidation:boolean,
  }) => {

    const [inputValue, setInputValue] = useState<string>('');

    // Handlers
    const validation = (phoneNumber:string) => {
      let isValid:boolean = false;

      if (requiredValidation) {
        if (phoneNumber !== '') {
          isValid = true;
        } else {
          isValid = false;
        }
      } else {
        isValid = true;
      }

      if(isValid) {
        onConfirm();
      } else {
        Toast.show({type: 'error', text1:'Movimiento invalido',
          text2: 'Debes proveer tu numero correctamente.',
        });
      }

    };

  return (
    <View style={tw`w-full flex flex-col justify-around items-center`}>
      { requiredValidation &&
      <View style={tw`w-full flex-col w-11/12 justify-center items-center`}>
        <Text style={
          tw`w-full flex flex-row items-start justify-start text-xl text-black`}>
          Nota:
        </Text>
        <Text style={tw`text-base text-black`}>{message}</Text>
        <View style={tw`mx-3 my-3 flex flex-row justify-center`}>
          <TextInput
            style={tw`h-10 w-3/4 
              border border-black rounded-lg px-4 bg-yellow-100 
              text-base text-black text-center`}
            placeholder="Numero teléfonico"
            onChangeText={(text) => { setInputValue(text); }}
            />
        </View>
      </View>
      }
      <View style={tw`my-3 flex flex-row justify-around`}>
        <ConfirmationBand
            textOnAccept={confirmMessageButton}
            textOnCancel={cancelMessageButton}
            handleOnAccept={() => { validation(inputValue); }}
            handleOnCancel={() => {onCancel();}}
        />
      </View>
    </View>
  );
};

export default VendorConfirmation;
