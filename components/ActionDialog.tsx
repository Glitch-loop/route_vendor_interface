// Libraries
import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import tw from 'twrnc';
import { Dialog, Portal } from 'react-native-paper';

// Components
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
          onDismiss={onDeclinedialog}>
            <View style={tw`flex flex-row justify-center`}>
              {children}
            </View>
            <View
              style={tw`flex flex-row justify-center my-5`}>
              <ConfirmationBand
                  textOnAccept={'Aceptar'}
                  textOnCancel={'Cancelar'}
                  handleOnAccept={onAcceptDialog}
                  handleOnCancel={onDeclinedialog}/>
            </View>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};


export default ActionDialog;
