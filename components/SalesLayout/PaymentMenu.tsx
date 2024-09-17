import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { RadioButton, TextInput } from 'react-native-paper';
import tw from 'twrnc';

import PAYMENT_METHODS from '../../utils/paymentMethod';
import { IPaymentMethod } from '../../interfaces/interfaces';


function calculateChange(total:number, received:number){
  if (total - received < 0) {
    return (total - received) * -1;
  } else {
    return 0;
  }
}

const PaymentMenu = ({
  paymentMethod,
  total
}:{
  paymentMethod:IPaymentMethod
  total:number
}) => {
  /*By default, cash method is selected*/
  const [moneyReceived, setMoneyReceived] = useState<number>(0);

  const handleTextChange = (input:string) => {
    let parsedInput = parseInt(input, 10);
    if (isNaN(parsedInput)) {
      setMoneyReceived(0);
    } else {
      setMoneyReceived(parsedInput);
    }
  };

  return (
    <View style={tw`w-full flex flex-col justify-center items-center`}>
      <View style={tw`flex flex-row justify-end my-1`}>
        <Text style={tw`flex flex-row basis-1/2 mr-3 justify-end text-right`}>Total:</Text>
        <Text style={tw`flex flex-row basis-1/2 text-left`}>${total}</Text>
      </View>
      <View style={tw`flex flex-row justify-end items-center my-1`}>
        <Text style={tw`flex flex-row basis-1/2 mr-3 justify-end text-right`}>Recibido:</Text>
        <View style={tw`flex flex-row basis-1/2 items-center`}>
          <Text>$</Text>
          <TextInput
            style={tw`border border-solid bg-white rounded-md h-5 text-center`}
            onChangeText={(text) => {
              handleTextChange(text);
            }}/>
        </View>
      </View>
      <View style={tw`flex flex-row justify-end my-1`}>
        <Text style={tw`flex flex-row basis-1/2 mr-3 justify-end text-right`}>Cambio:</Text>
        <Text style={tw`flex flex-row basis-1/2 text-left`}>
          ${calculateChange(total, moneyReceived)}
        </Text>
      </View>
    </View>
  );
};

export default PaymentMenu;
