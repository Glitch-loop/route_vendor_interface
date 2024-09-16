import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { RadioButton } from 'react-native-paper';
import tw from 'twrnc';

const PaymentMethod = () => {
  const [checked, setChecked] = useState('first');

  return (
    <View>
      <View style={tw`flex flex-row items-center`}>
        <RadioButton
          value="first"
          status={ checked === 'first' ? 'checked' : 'unchecked' }
          onPress={() => setChecked('first')}
        />
        <Text style={tw`ml-2 text-lg text-black`}>Dinero</Text>
      </View>
      <View style={tw`flex flex-row items-center`}>
        <RadioButton
          value="first"
          status={ checked === 'first' ? 'checked' : 'unchecked' }
          onPress={() => setChecked('first')}
        />
        <Text style={tw`ml-2 text-lg text-black`}>Transferencia</Text>
      </View>
      <View style={tw`flex flex-row items-center`}>
        <RadioButton
          value="first"
          status={ checked === 'first' ? 'checked' : 'unchecked' }
          onPress={() => setChecked('first')}
        />
        <Text style={tw`ml-2 text-lg text-black`}>Tarjeta de debito</Text>
      </View>
      <View style={tw`flex flex-row items-center`}>
        <RadioButton
          value="first"
          status={ checked === 'first' ? 'checked' : 'unchecked' }
          onPress={() => setChecked('first')}
        />
        <Text style={tw`ml-2 text-lg text-black`}>Tarjeta de credito</Text>
      </View>
    </View>
  );
};

export default PaymentMethod;
