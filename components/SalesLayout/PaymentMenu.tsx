// Libraries
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import tw from 'twrnc';

// Interfaces
import { IPaymentMethod } from '../../interfaces/interfaces';

// Utils
import { getTransactionIdentifier, calculateChange } from '../../utils/saleFunction';

function initializeState(total:number, paymentMethod: IPaymentMethod) {
  let result:number = 0;
  if (paymentMethod.id_payment_method === '52757755-1471-44c3-b6d5-07f7f83a0f6f') {
    // Cash method
    result = 0;
  } else if (paymentMethod.id_payment_method === 'b68e6be3-8919-41dd-9d09-6527884e162e') {
    // Transference
    result = total;
  } else {
    // By default is cash method
    result = 0;
  }

  return result;
}

const PaymentMenu = ({
  transactionIdentifier,
  paymentMethod,
  total,
  onCashReceived,
}:{
  transactionIdentifier:string
  paymentMethod:IPaymentMethod
  total:number,
  onCashReceived:any,
}) => {
  /*By default, cash method is selected*/
  const [cashReceived, setCashReceived] = useState<number>(initializeState(total, paymentMethod));

  const handleTextChange = (input:string) => {
    let parsedInput = parseInt(input, 10);
    if (isNaN(parsedInput)) {
      onCashReceived(0);
      setCashReceived(0);
    } else {
      onCashReceived(parsedInput);
      setCashReceived(parsedInput);
    }
  };

  return (
    <View style={tw`w-full flex flex-col justify-center items-center`}>
      <Text style={tw`text-center text-black text-2xl my-2`}>
        Total a { total > 0 ? 'cobrar' : 'reembolsar' }
      </Text>
      <View style={tw`flex flex-row justify-end my-1`}>
        <Text
          style={tw`mr-3 text-xl text-black text-right flex flex-row basis-1/2 justify-end`}>
          Total:
        </Text>
        <Text style={tw`text-xl text-black text-left flex flex-row basis-1/2`}>
          ${total > 0 ? total : total * -1 }
        </Text>
      </View>
      {/* Section for cash method */}
      { paymentMethod.id_payment_method === '52757755-1471-44c3-b6d5-07f7f83a0f6f' &&
        <View style={tw`flex flex-row justify-end items-center my-1`}>
          <Text style={tw`mr-3 text-xl text-black text-right flex flex-row basis-1/2 justify-end `}>
            {total > 0 ? 'Recibido:' : 'Entregado:' }
          </Text>
          <View style={tw`text-xl text-black flex flex-row basis-1/2 items-center`}>
            <Text style={tw`text-xl text-black`}>$</Text>
            <TextInput
              keyboardType={'numeric'}
              style={tw`border border-solid bg-white rounded-md h-5 text-center`}
              onChangeText={(text) => { handleTextChange(text); }}/>
          </View>
        </View>
      }
      {/* Section for cash method */}
      { paymentMethod.id_payment_method === '52757755-1471-44c3-b6d5-07f7f83a0f6f' &&
        <View style={tw`flex flex-row justify-end items-center my-1`}>
          <Text style={tw`mr-3 text-black text-xl text-right flex flex-row basis-1/2 justify-end`}>
            Cambio { total > 0 ? '(a entregar)' : '(a recibir)'}:
          </Text>
          <Text style={tw`text-black text-xl text-left flex flex-row basis-1/2`}>
            ${calculateChange(total, cashReceived)}
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
          {getTransactionIdentifier(transactionIdentifier)}
          </Text>
      </View>
      }
    </View>
  );
};

export default PaymentMenu;
