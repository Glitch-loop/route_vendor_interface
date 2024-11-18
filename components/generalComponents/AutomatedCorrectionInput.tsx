// Libraries
import React, { useEffect, useState } from 'react';
import { TextInput, Keyboard } from 'react-native';
import tw from 'twrnc';

const AutomatedCorrectionNumberInput = ({
  amount,
  onChangeAmount,
}:{
  amount:number,
  onChangeAmount:any
}) => {
  const [inputValue, setInputValue] = useState(amount.toString());
  const [lastInput, setLastInput] = useState('');
  const [isTypping, setIsTypping] = useState(false);

  useEffect(() => {
    if (isTypping) {
      /* It is not possible to update the input while user is typping*/
    } else {
      /* Once the user finished of typping, update the what shows the input*/
      setInputValue(amount.toString());
    }
  },[amount, isTypping]);

  // Handlers
  const handleTextChange = (input:string) => {
    if (input === '') {
      /* User didn't type anything */
      input = lastInput;
    } else {
      /* User type some different from what is in the current input */
    }

    let resultInput:number = 0;
    let parsedInput:number = parseInt(input, 10);

    if (isNaN(parsedInput)) {
      resultInput = 0;
    } else {
      /* Number range for this component >= 0 */
      if (parsedInput < 0) {
        resultInput = 0;
      } else {
        resultInput = parsedInput;
      }
    }
    setInputValue(input);
    onChangeAmount(resultInput);
  };

  const handleAvoidingFalseTouch = async (input:string) => {
    setTimeout(() => {
      // input === '' && lastInput === ''
      if (input === '' && !Keyboard.isVisible()) {
        /* User didn't type anything */
        if (lastInput === '') {
          input = '0';
        } else {
          /* There is instructions */
        }
        handleTextChange(input);
      } else {
        /* There is no instructions */
      }
    }, 300);
  };

  return (
    <TextInput
    style={tw`mx-1 border border-solid bg-white rounded-md h-10 text-center`}
    value={inputValue}
    onTouchStart={ () => {
      setIsTypping(true);
      setInputValue('');
      setLastInput(inputValue);
    }}
    onTouchEnd={() => { handleAvoidingFalseTouch(inputValue); }}
    onEndEditing={() => {

      setIsTypping(false);
      handleTextChange(inputValue);
      setLastInput('');
    }}

    onChangeText={(text) => { setInputValue(text); }}
    keyboardType={'numeric'}/>
  );
};

export default AutomatedCorrectionNumberInput;
