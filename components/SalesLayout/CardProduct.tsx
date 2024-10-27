import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
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
    onDeleteItem,
  }:{
    productName:string,
    price:number,
    amount:number,
    subtotal:number,
    item:IProductInventory,
    onChangeAmount:any,
    onDeleteItem: any,
  }) => {

    const [inputValue, setInputValue] = useState(amount.toString());

    useEffect(() => {
      setInputValue(amount.toString());
    },[amount, inputValue]);

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

  const handleOnDeleteItem = () => {
    onDeleteItem(item);
  };

  return (
    <View style={tw`w-11/12 h-16
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
          }}
          keyboardType={'numeric'}/>
        <ActionButton
          style={'bg-blue-700'}
          onClick={handleOnPlusOne}>
          <Icon name="plus" style={tw`text-base text-center`} color="#000"/>
        </ActionButton>
      </View>
      <View style={tw`flex flex-row basis-1/6 justify-center`}>
        <Text style={tw`text-black`}>${subtotal}</Text>
      </View>
      <View style={tw`w-full h-full absolute bottom-2 left-2 flex flex-row justify-end items-start`}>
        <View>
          <Pressable
            onPress={() => {handleOnDeleteItem()}}
            style={tw`bg-red-400 p-2 rounded-full`}>
            <Icon name={'remove'} style={tw`text-white`}/>
          </Pressable>
        </View>
      </View>
    </View>
  )
};

export default CardProduct;
