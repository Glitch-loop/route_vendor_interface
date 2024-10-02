import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import tw from 'twrnc';

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
  total,
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
      <Text style={tw`text-center text-black text-2xl my-2`}>Total a pagar</Text>
      <View style={tw`flex flex-row justify-end my-1`}>
        <Text
          style={tw`mr-3 text-xl text-black text-right flex flex-row basis-1/2 justify-end`}>
          Total:
        </Text>
        <Text style={tw`text-xl text-black text-left flex flex-row basis-1/2`}>
          ${total}
        </Text>
      </View>
      {/* Section for cash method */}
      { paymentMethod.id_payment_method === '52757755-1471-44c3-b6d5-07f7f83a0f6f' &&
        <View style={tw`flex flex-row justify-end items-center my-1`}>
          <Text style={tw`mr-3 text-xl text-black text-right flex flex-row basis-1/2 justify-end `}>
            Recibido:
          </Text>
          <View style={tw`text-xl text-black flex flex-row basis-1/2 items-center`}>
            <Text style={tw`text-xl text-black`}>$</Text>
            <TextInput
              keyboardType={'numeric'}
              style={tw`border border-solid bg-white rounded-md h-5 text-center`}
              onChangeText={(text) => {
                handleTextChange(text);
              }}/>
          </View>
        </View>
      }
      {/* Section for cash method */}
      { paymentMethod.id_payment_method === '52757755-1471-44c3-b6d5-07f7f83a0f6f' &&
        <View style={tw`flex flex-row justify-end my-1`}>
          <Text style={tw`mr-3 text-black text-xl text-right flex flex-row basis-1/2 justify-end`}>
            Cambio:
          </Text>
          <Text style={tw`text-black text-xl text-left flex flex-row basis-1/2`}>
            ${calculateChange(total, moneyReceived)}
          </Text>
        </View>
      }
      {/* Section for transference */}
      { paymentMethod.id_payment_method === 'b68e6be3-8919-41dd-9d09-6527884e162e' &&
        <View style={tw`flex flex-row justify-end my-1`}>
          <Text style={tw`mr-3 text-black text-xl text-right flex flex-row basis-1/2 justify-end`}>
            Referencia:
          </Text>
          <Text style={tw`text-black text-xl text-left flex flex-row basis-1/2`}>
            Pendiente crear referencia
          </Text>
      </View>
      }
    </View>
  );
};

export default PaymentMenu;
