// Libraries
import React, { useState } from 'react';
import { ToastAndroid } from 'react-native';

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
  onCancelPaymentProcess,
  onPaySale,
}:{
  transactionIdentifier:string,
  totalToPay:number,
  paymentProcess:boolean,
  onCancelPaymentProcess:any,
  onPaySale:any,
}) => {

  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState<boolean>(false);

  const [paymnetMethod, setPaymentMethod] = useState<IPaymentMethod>(PAYMENT_METHODS[0]);
  const [cashReceived, setCashReceived] = useState<number>(0);

  const handleConfirmPaymentMethod = () => {
    setConfirmedPaymentMethod(true);
  };


  const handlerPaySale = async () => {
    let resultCashMovement = 0;
    let messageToShow = '';

    if (paymnetMethod.id_payment_method === '52757755-1471-44c3-b6d5-07f7f83a0f6f') {
      // Cash payment method
      if (totalToPay >= 0) {
          /* It means the vendor will receive money, product of a sale or due to a product devolution with positive balance */
        resultCashMovement = cashReceived - totalToPay;
        messageToShow = 'El dinero a recibir tiene que ser igual o mayor al total.';
      } else {
        /* It means the vendor will give money, product of a product devolution with negative balance */
        resultCashMovement = totalToPay + cashReceived;
        messageToShow = 'El dinero a entregar tiene que cubrir el monto a reponer.';
      }

      if (resultCashMovement >= 0) {
        // Call to the function to register the sale
        await onPaySale(cashReceived, paymnetMethod);
      } else {
        ToastAndroid.show(messageToShow, 1500);
      }
    } else if (paymnetMethod.id_payment_method === 'b68e6be3-8919-41dd-9d09-6527884e162e'){ 
      // Transference method
      /* Since transference is a digital method, the vendor doesn't recieve cash, so
      according with the flow of the application, cashReceived should be zero. */
      await onPaySale(cashReceived, paymnetMethod);
    }
  };

  const handlerDeclineDialog = () => {
    setCashReceived(0);
    onCancelPaymentProcess(false);
    setPaymentMethod(PAYMENT_METHODS[0]);
    setConfirmedPaymentMethod(false);
  };

  const handlerSelectPaymentMethod = (selectedPaymentMethod:IPaymentMethod) => {
    setPaymentMethod(selectedPaymentMethod);
  };

  return (
    <ActionDialog
    visible={paymentProcess}
    onAcceptDialog={confirmedPaymentMethod === true ? handlerPaySale : handleConfirmPaymentMethod}
    onDeclinedialog={handlerDeclineDialog}>
      { confirmedPaymentMethod === true ?
        <PaymentMenu
          transactionIdentifier={transactionIdentifier}
          total={totalToPay}
          paymentMethod={paymnetMethod}
          onCashReceived={setCashReceived}/>
          :
        <PaymentMethod
          currentPaymentMethod={paymnetMethod}
          onSelectPaymentMethod={
            (selectedPaymentMethod:IPaymentMethod) => handlerSelectPaymentMethod(selectedPaymentMethod)}/>
      }
    </ActionDialog>
  );
};

export default PaymentProcess;
