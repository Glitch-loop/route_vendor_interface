// Libraries
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';

// Components
import RouteMap from '../components/RouteMap';

const StoreMenuLayout = ({navigation, goTo}:{navigation:any, goTo:string}) => {
  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <View style={tw`w-full flex my-5 flex-row justify-around items-center`}>
        <Pressable
          style={tw`bg-blue-700 px-4 py-3 rounded-full flex flex-row justify-center`}
          onPress={() => navigation.navigate(goTo)}>
          <Icon name="chevron-left" style={tw`text-base text-center`} color="#fff" />
        </Pressable>
        <Text style={tw`text-3xl`}>Ruta 1</Text>
        <Text style={tw`text-2xl mx-1`}>|</Text>
        <Text style={tw`text-xl max-w-1/2`}>Deposito y Tienda de la esquina</Text>
        <View style={tw`flex flex-row h-6 w-6 bg-indigo-500 rounded-full`} />
      </View>
      <View style={tw`h-1/2 w-11/12 flex-1 border-solid border-2 rounded-sm`}>
        <RouteMap />
      </View>
      <View style={tw`flex-1 w-11/12 flex-col`}>
        <View style={tw`flex flex-row basis-1/3 justify-around items-center`}>
          <View style={tw`flex flex-col basis-1/2 justify-around`}>
            <Text style={tw`text-black text-xl`}>Dirección</Text>
            <Text style={tw`text-black`}>Mariano otero  #1256, Atemajac del Valle</Text>
          </View>
          <View style={tw`flex flex-col basis-1/2 justify-around`}>
            <Text style={[tw`text-black text-xl`, { lineHeight: 20! }]}>Información del cliente</Text>
            <Text style={tw`text-black`}>John Doe | 322-789-4521</Text>
          </View>
        </View>
        <View style={tw`flex flex-col basis-1/3 justify-center`}>
          <Text style={tw`text-black text-xl`}>Referencia</Text>
          <Text style={tw`text-black`}>
            Entre una hamburgeseria y una pizzeria, tienda que esta muy escondida.
          </Text>
        </View>
        <View style={tw`h-3/5 h-1/2 flex flex-row basis-1/3 justify-around items-center`}>
          <View style={tw`h-1/2 flex basis-1/2`}>
            <Pressable style={tw`w-11/12 h-full border-solid border bg-blue-500 
              rounded flex flex-row justify-center items-center`}>
              <Text style={tw`text-center text-black`}>Transacciones de hoy</Text>
            </Pressable>
          </View>
          <View style={tw`h-1/2 flex basis-1/2`}>
            <Pressable style={tw`h-full w-11/12 bg-green-500 rounded border-solid border
              flex flex-row justify-center  items-center`}>
              <Text style={tw`text-center text-black`}>Iniciar venta</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default StoreMenuLayout;
