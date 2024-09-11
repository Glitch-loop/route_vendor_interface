// Libraries
import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Checkbox } from 'react-native-paper';
import tw from 'twrnc';

// Interfaces
import { ICurrency, IProductInventory } from '../interfaces/interfaces';

// Queries and utils
import DAYS_OPERATIONS from '../lib/day_operations';

// Redux state
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { setDayInformation } from '../redux/slices/routeDaySlice';
import { setProductInventory } from '../redux/slices/productsInventorySlice';

/*
  It is important to note that it is in this view where the user confirm the actions.
  It doesn't matter what type of inventory operation he is doing, in all the cases he
  is going to use this component to confirm (or sign) the operation that he is doing.
*/

const VendorConfirmation = ({
  navigation,
  message,
  cashInventory,
  inventory,
  goToConfirm,
  goToCancel,
  }:{
  navigation:any,
  message:string,
  cashInventory:ICurrency[],
  inventory:IProductInventory[],
  goToConfirm:string,
  goToCancel:string}) => {

  // Creating states
  const [checked, setChecked] = useState(false);

  // Defining redux contexts
  const dispatch: AppDispatch = useDispatch();
  const currentOperation = useSelector((state: RootState) => state.currentOperation);
  const productsInventory = useSelector((state: RootState) => state.productsInventory);
  const routeDay = useSelector((state: RootState) => state.routeDay);

  const handleVendorConfirmation = ():void => {
    try {
      /*
        TODO:
         Save inventory state
      */

      if (DAYS_OPERATIONS.start_shift_inventory === currentOperation.id_type_operation) {
        //Setting information related to the route that is going to be performed today.

        //Setting initial inventory.

        //Setting routes plannification.

      }
        
      
      navigation.navigate(goToConfirm);
    } catch (error) {
      console.log("Something went wrong")
    }
  };

  return (
    <View
    style={tw`w-full flex flex-row justify-around items-center`}>
      <View style={tw`mx-3 flex flex-col`}>
        <Text style={tw`text-xl text-black`}>Nota:</Text>
        <Text style={tw`text-base text-black`}>{message}</Text>
        <View style={tw`mx-3 mt-3 flex flex-row `}>
          <Checkbox
            status={checked ? 'checked' : 'unchecked'}
            onPress={() => {
              setChecked(!checked);
            }}
            color="#6200ee"
            uncheckedColor="#666"/>
          <TextInput
            style={tw`h-10 w-3/4 
              border border-black rounded-lg px-4 bg-yellow-100 
              text-base text-black text-center`}
            // value={}
            placeholder="Numero teléfonico"
            />
        </View>
        <View style={tw`flex flex-row justify-around mt-3`}>
          <Pressable
            onPress={() => navigation.navigate(goToCancel)}
            style={tw`bg-orange-500 px-4 py-3 border border-black
            rounded flex flex-row justify-center border-solid`}>
            <Text>Cancelar</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              handleVendorConfirmation();
            }}
            style={tw`bg-green-500 px-4 py-3 
            border border-black rounded flex flex-row justify-center`}>
            <Text>confirmar</Text>
          </Pressable>
          </View>
      </View>
    </View>
  );
};

export default VendorConfirmation;
