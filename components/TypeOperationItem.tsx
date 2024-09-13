//Libraries
import React from 'react';
import { Text, View } from 'react-native';
import tw from 'twrnc';

const TypeOperationItem = () => {
  return (
    <View style={tw`w-11/12 flex flex-col flex-wrap justify-start`}>
      <View style={tw`ml-2 mb-2 flex flex-row items-center`}>
        <View style={tw`flex flex-row h-8 w-8 bg-amber-200/75 rounded-full`} />
        <Text style={tw`ml-2 text-black flex flex-row items-center`}>Tiendas visitadas</Text>
      </View>
      <View style={tw`ml-2 mb-2 flex flex-row items-center`}>
        <View style={tw`flex flex-row h-8 w-8 bg-amber-300  rounded-full`} />
        <Text style={tw`ml-2 text-black flex flex-row items-center`}>Tiendas de la ruta pendiente</Text>
      </View>
      <View style={tw`ml-2 mb-2 flex flex-row items-center`}>
        <View style={tw`flex flex-row h-8 w-8 bg-amber-500 rounded-full`} />
        <Text style={tw`ml-2 text-sm text-black flex flex-row items-center`}>Petición para visitar</Text>
      </View>
      <View style={tw`ml-2 mb-2 flex flex-row items-center`}>
        <View style={tw`flex flex-row h-8 w-8 bg-green-400 rounded-full`} />
        <Text style={tw`ml-2 text-black flex flex-row items-center`}>Nuevo cliente</Text>
      </View>
      <View style={tw`ml-2 mb-2 flex flex-row items-center`}>
        <View style={tw`flex flex-row h-8 w-8 bg-orange-600 rounded-full`} />
        <Text style={tw`ml-2 text-black flex flex-row items-center`}>Venta especial</Text>
      </View>
      <View style={tw`ml-2 mb-2 flex flex-row items-center`}>
        <View style={tw`flex flex-row h-8 w-8 bg-red-300 rounded-full`} />
        <Text style={tw`ml-2 text-black flex flex-row items-center`}>Operación de inventario</Text>
      </View>
      <View style={tw`ml-2 mb-2 flex flex-row items-center`}>
        <View style={tw`flex flex-row h-8 w-8 bg-indigo-500 rounded-full`} />
        <Text style={tw`ml-2 text-black flex flex-row items-center`}>Cliente actual</Text>
      </View>
    </View>
  );
};



export default TypeOperationItem;
