// Libraries
import React, { useState } from 'react';
import { View } from 'react-native';
import tw from 'twrnc';

// Interfaces
import { IPaymentMethod } from '../../interfaces/interfaces';

// Utils
import PAYMENT_METHODS from '../../utils/paymentMethod';

// Components
import PaymentMenu from './PaymentMenu';
import PaymentMethod from './PaymentMethod';

const PaymentProcess = ({
  transactionIdentifier,
  totalToPay,
  confirmedPaymentMethod,
  handleOnSelectPaymentMethod,
  handleOnCashMovement,
}:{
  transactionIdentifier:string,
  totalToPay:number,
  confirmedPaymentMethod:boolean,
  handleOnSelectPaymentMethod:any,
  handleOnCashMovement:any,
}) => {

  const [paymnetMethod, setPaymentMethod] = useState<IPaymentMethod>(PAYMENT_METHODS[0]);
  const [cashMovement, setCashMovement] = useState<number>(0);


  const onSelectPaymentMethod = (selectedPaymentMethod:IPaymentMethod) => {
    handleOnSelectPaymentMethod(selectedPaymentMethod);
    setPaymentMethod(selectedPaymentMethod);
  };

  const onCashMovement = (cashMovementDone:number) => {
    console.log("On process: ", cashMovementDone)
    handleOnCashMovement(cashMovementDone);
    setCashMovement(cashMovementDone);
  };

  return (
    <View style={tw`flex flex-row`}>
      { confirmedPaymentMethod === true ?
        <PaymentMenu
          transactionIdentifier={transactionIdentifier}
          total={totalToPay}
          paymentMethod={paymnetMethod}
          handleOnRecieveCash={
            (cashMovementDone:number) => onCashMovement(cashMovementDone)}
          />
          :
        <PaymentMethod
          currentPaymentMethod={paymnetMethod}
          onSelectPaymentMethod={
            (selectedPaymentMethod:IPaymentMethod) => onSelectPaymentMethod(selectedPaymentMethod)}/>
      }
    </View>
  );
};

export default PaymentProcess;
