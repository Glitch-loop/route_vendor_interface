import React from 'react';
import { Pressable, View, Text } from 'react-native';
import tw from 'twrnc';
import RouteHeader from '../components/RouteHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import ConfirmationBand from '../components/ConfirmationBand';


const ResultSaleLayout = ({navigation}:{navigation:any}) => {
  return (
    <View style={tw`w-full h-full flex flex-col items-center justify-center`}>
      <View style={
        tw`bg-green-500 w-6/12 h-3/12 rounded-full flex flex-row justify-center items-center`}>
        <Icon name="check" size={80} color="#fff"/>
      </View>
      <View style={
        tw`bg-red-500 w-6/12 h-3/12 rounded-full flex flex-row justify-center items-center`}>
        <Icon name="remove" size={80} color="#fff"/>
      </View>
      <Text style={tw`text-black text-3xl text-center`}>Venta completada exitosamente</Text>
      <Text style={tw`text-black text-3xl text-center`}>Algo salio mal... intenta nuevamente</Text>
      <View style={tw`w-full`}>
        <ConfirmationBand
            textOnAccept={'Continuar'}
            textOnCancel={'Imprimir ticket'}
            handleOnAccept={()=>{}}
            handleOnCancel={()=>{}}
            styleOnCancel={'bg-blue-500'}
        />
      </View>
      <View style={tw`w-full`}>
        <ConfirmationBand
            textOnAccept={'Continuar con el siguiente cliente'}
            textOnCancel={'Intentar de nuevo'}
            handleOnAccept={()=>{}}
            handleOnCancel={()=>{}}
            styleOnAccept={'bg-orange-500'}
            styleOnCancel={'bg-amber-400'}
        />
      </View>
    </View>
  );
};

export default ResultSaleLayout;
