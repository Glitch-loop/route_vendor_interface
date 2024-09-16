import React, {useEffect, useState} from 'react';
import { View, Text, TextInput, Keyboard } from 'react-native';
import tw from 'twrnc';
import ActionButton from './ActionButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import { IProductInventory } from '../../interfaces/interfaces';

const CardProduct = ({
    productName,
    price,
    amount,
    subtotal,
    item,
    onChangeAmount,
  }:{
    productName:string,
    price:number,
    amount:number,
    subtotal:number,
    item:IProductInventory,
    onChangeAmount:any,
  }) => {

    const [inputValue, setInputValue] = useState('');

    // useEffect(() => {
    //   // Add an event listener for when the keyboard hides
    //   const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
    //     handleTextChange(inputValue);
    //   });
    //   // Clean up the event listener when the component unmounts
    //   return () => {
    //     keyboardHideListener.remove();
    //   };
    // }, [inputValue]);
    
  // Handlers
  const handleTextChange = (input:string) => {
    let parsedInput = parseInt(input, 10);
    if (isNaN(parsedInput)) {
      onChangeAmount(item, 0);
    } else {
      onChangeAmount(item, parsedInput);
    }
  };

  const handleOnMinusOne = () => {
    let newValue = item.amount - 1;
    if  (newValue >= 0) {
      onChangeAmount(item, item.amount - 1);
      setInputValue((item.amount - 1).toString());
    }
  };

  const handleOnPlusOne = () => {
    onChangeAmount(item, item.amount + 1);
    setInputValue((item.amount + 1).toString());
  };

  return (
    <View style={tw`
      w-11/12 h-16
      bg-amber-200/75 border-solid border rounded-md
      flex flex-row justify-center items-center
      `}>
      <View style={tw`flex flex-row basis-2/6 justify-center`}>
        <Text style={tw`text-black`}>{productName}</Text>
      </View>
      <View style={tw`flex flex-row basis-1/6 justify-center`}>
        <Text style={tw`text-black`}>${price}</Text>
      </View>
      <View style={tw`flex flex-row basis-2/6 justify-around items-center`}>
        <ActionButton
          style={'bg-red-600'}
          onClick={handleOnMinusOne}>
          <Icon name="minus" style={tw`text-base text-center`} color="#000"/>
        </ActionButton>
        <TextInput
          style={tw`mx-1 border border-solid bg-white rounded-md h-10 text-center`}
          value={inputValue}
          onChangeText={(text) => {
            setInputValue(text);
            handleTextChange(text);
            // debouncedHandleTextChange(text,300);
          }}/>
        <ActionButton
          style={'bg-blue-700'}
          onClick={handleOnPlusOne}>
          <Icon name="plus" style={tw`text-base text-center`} color="#000"/>
        </ActionButton>
      </View>
      <View style={tw`flex flex-row basis-1/6 justify-center`}>
        <Text style={tw`text-black`}>${subtotal}</Text>
      </View>
    </View>
  )
};

export default CardProduct;
