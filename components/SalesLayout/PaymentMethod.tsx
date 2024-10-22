import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { RadioButton } from 'react-native-paper';
import tw from 'twrnc';

import PAYMENT_METHODS from '../../utils/paymentMethod';
import { IPaymentMethod } from '../../interfaces/interfaces';

const PaymentMethod = ({
    currentPaymentMethod,
    onSelectPaymentMethod,
  }:{
    currentPaymentMethod:IPaymentMethod,
    onSelectPaymentMethod:any,
  }) => {
  /*By default, cash method is selected*/
  const [selectedMethod, setSelectedMethod] = useState<IPaymentMethod>(currentPaymentMethod);

  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>(PAYMENT_METHODS);

  return (
    <View>
      <Text style={tw`text-lg text-black text-center mb-2`}>Selecciona una opción</Text>
      { paymentMethods.map(paymentMethod => {
        return (
          <View
          key={paymentMethod.id_payment_method}
          style={tw`flex flex-row items-center`}>
            <RadioButton
              value="first"
              status={ paymentMethod.id_payment_method === selectedMethod.id_payment_method ? 'checked' : 'unchecked' }
              onPress={() => {
                setSelectedMethod(paymentMethod);
                onSelectPaymentMethod(paymentMethod);
              }}
            />
            <Text style={tw`ml-2 text-lg text-black`}>{paymentMethod.payment_method_name}</Text>
          </View>
      );})}
    </View>
  );
};

export default PaymentMethod;
