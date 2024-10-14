import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';
import ConfirmationBand from './ConfirmationBand';

const ResultSale = ({
  resultSaleState,
  onSuccessfullCompletion,
  onPrintTicket,
  onFailedCompletion,
  onTryAgain,
}:{
  resultSaleState:boolean,
  onSuccessfullCompletion:any,
  onPrintTicket:any,
  onFailedCompletion:any,
  onTryAgain:any,
}) => {
  return (
    <View style={tw`w-full h-full flex flex-col items-center justify-center`}>
      { resultSaleState ?
        <View style={
          tw`bg-green-500 w-6/12 h-3/12 rounded-full flex flex-row justify-center items-center`}>
          <Icon name="check" size={80} color="#fff"/>
        </View> :
        <View style={
          tw`bg-red-500 w-6/12 h-3/12 rounded-full flex flex-row justify-center items-center`}>
          <Icon name="remove" size={80} color="#fff"/>
        </View>
      }
      <Text style={tw`my-10 text-black text-3xl text-center`}>
        { resultSaleState ? 'Venta completada exitosamente' : 'Algo salio mal... intenta nuevamente' }
      </Text>
      <View style={tw`w-full`}>
        <ConfirmationBand
            textOnAccept={resultSaleState ? 'Continuar' : 'Continuar con el siguiente cliente'}
            textOnCancel={resultSaleState ? 'Imprimir ticket' : 'Intentar de nuevo'}
            handleOnAccept={resultSaleState ? onSuccessfullCompletion : onFailedCompletion}
            handleOnCancel={resultSaleState ? onPrintTicket : onTryAgain}
            styleOnAccept={resultSaleState ? 'bg-green-500' : 'bg-orange-500'}
            styleOnCancel={resultSaleState ? 'bg-blue-500' : 'bg-amber-400'}/>
      </View>
    </View>
  );
};

export default ResultSale;
