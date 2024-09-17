import React from 'react';
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Dialog, Portal, Provider } from 'react-native-paper';
import ConfirmationBand from './ConfirmationBand';


const ActiononDialog = (
  {
    children,
    visible,
    setVisible,
    message,
    confirmation,
  }:{
    children:any,
    visible:boolean,
    setVisible:any,
    message:string,
    confirmation:boolean,
  }) => {
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <Portal>
        <Dialog
        visible={visible}
        onDismiss={hideModal}
        style={tw`flex flex-col items-center justify-center`}>
        <View style={tw`flex flex-row basis-3/4 justify-center items-center`}>
          {children}
        </View>
        <View
          style={tw`w-full flex flex-row basis-1/4 justify-center`}>
          <ConfirmationBand
              textOnAccept={'Continuar'}
              textOnCancel={'Cancelar operación'}
              handleOnAccept={()=>{}}
              handleOnCancel={()=>{}}
          />
        </View>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};


export default ActiononDialog;
