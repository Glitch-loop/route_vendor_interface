import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Dialog, Portal } from 'react-native-paper';


const ConfirmationDialog = (
  {visible, setVisible, message, confirmation}:
  {visible:boolean, setVisible:any, message:string, confirmation:boolean}) => {
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Portal>
        <Dialog
        visible={visible}
        onDismiss={hideModal}
        style={tw`h-1/2 flex flex-col items-center justify-start`}>
          <Text style={tw`text-lg w-3/4 text-center text-black flex flex-row basis-1/3 items-center justify-center`}>
            {message}
          </Text>
          <View style={tw`flex basis-1/3`}>
            { confirmation ?
                <TextInput 
                  style={{height: 40}}
                  placeholder="Type here to translate!"
                /> :
                <View style={tw`px-8 py-3
                    rounded-full bg-blue-500 text-center 
                    flex flex-row items-center justify-center
                    `}>
                  <Icon name="question" style={tw`mt-2 text-6xl`} color="#F2F2F2" />
                </View>
            }
          </View>
          <View style={tw`w-full`}>
            <View style={tw`flex flex-row justify-around`}>
              <Pressable style={
                tw`bg-orange-500 px-4 py-3 
                rounded flex flex-row justify-center 
                border-solid`}>
                <Text>Cancelar</Text>
              </Pressable>
              <Pressable style={tw`bg-green-500 px-4 py-3 rounded flex flex-row justify-center`}>
                <Text>confirmar</Text>
              </Pressable>
            </View>
          </View>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};


export default ConfirmationDialog;
