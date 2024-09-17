import React from 'react';
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Dialog, Portal, Provider } from 'react-native-paper';
import ConfirmationBand from './ConfirmationBand';


const ActionDialog = (
  {
    children,
    visible,
    onAcceptDialog,
    onDeclinedialog,
  }:{
    children:any,
    visible:boolean,
    onAcceptDialog:any,
    onDeclinedialog:any,
  }) => {


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={onDeclinedialog}
          >
            <View style={tw`flex flex-row justify-center`}>
              {children}
            </View>
            <View
              style={tw`flex flex-row justify-center my-5`}>
              <ConfirmationBand
                  textOnAccept={'Aceptar'}
                  textOnCancel={'Cancelar operación'}
                  handleOnAccept={onAcceptDialog}
                  handleOnCancel={onDeclinedialog}/>
            </View>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};


export default ActionDialog;
