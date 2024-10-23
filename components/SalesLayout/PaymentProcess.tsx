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
import ActionDialog from '../ActionDialog';

const PaymentProcess = ({
  transactionIdentifier,
  totalToPay,
  paymentProcess,
  handleOnPaymentProcess,
  handleOnSelectPaymentMethod,
  handleOnCashMovement,
}:{
  transactionIdentifier:string,
  totalToPay:number,
  paymentProcess:boolean,
  handleOnPaymentProcess:any,
  handleOnSelectPaymentMethod:any,
  handleOnCashMovement:any,
}) => {

  const [paymnetMethod, setPaymentMethod] = useState<IPaymentMethod>(PAYMENT_METHODS[0]);
  const [cashMovement, setCashMovement] = useState<number>(0);

  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState<boolean>(false);

  const handleConfirmPaymentMethod = () => {
    setConfirmedPaymentMethod(true);
  };


  const handlePaySale = () => {
    console.log("Closing sale")
  }

  const handlerDeclineDialog = () => {
    handleOnPaymentProcess(false);
    setPaymentMethod(PAYMENT_METHODS[0]);
    setConfirmedPaymentMethod(false);
  };

  const onSelectPaymentMethod = (selectedPaymentMethod:IPaymentMethod) => {
    handleOnSelectPaymentMethod(selectedPaymentMethod);
    setPaymentMethod(selectedPaymentMethod);
  };

  const onCashMovement = (cashMovementDone:number) => {
    setCashMovement(cashMovementDone);
    handleOnCashMovement(cashMovementDone);
  };

  return (
    <ActionDialog
    visible={paymentProcess}
    onAcceptDialog={confirmedPaymentMethod === true ? handlePaySale : handleConfirmPaymentMethod}
    onDeclinedialog={handlerDeclineDialog}>
      { confirmedPaymentMethod === true ?
        <PaymentMenu
          transactionIdentifier={transactionIdentifier}
          total={totalToPay}
          paymentMethod={paymnetMethod}
          handleOnRecieveCash={(cashMovementDone:number) => onCashMovement(cashMovementDone)}/>
          :
        <PaymentMethod
          currentPaymentMethod={paymnetMethod}
          onSelectPaymentMethod={
            (selectedPaymentMethod:IPaymentMethod) => onSelectPaymentMethod(selectedPaymentMethod)}/>
      }
    </ActionDialog>
  );
};

export default PaymentProcess;
