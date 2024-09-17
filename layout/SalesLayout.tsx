// Libraries
import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import tw from 'twrnc';

// Redux context.
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';

// Interfaces and utils
import { IPaymentMethod, IProductInventory } from '../interfaces/interfaces';
import {
  getMessageForProductDevolutionOperation,
  getProductDevolutionBalanceWithoutNegativeNumber,
} from '../utils/saleFunction';
import PAYMENT_METHODS from '../utils/paymentMethod';

// Components
import productInventory from '../moocks/productInventory';
import TableProduct from '../components/SalesLayout/TableProduct';
import SaleSummarize from '../components/SalesLayout/SaleSummarize';
import ConfirmationBand from '../components/ConfirmationBand';
import ActionDialog from '../components/ActionDialog';
import PaymentMethod from '../components/SalesLayout/PaymentMethod';
import PaymentMenu from '../components/SalesLayout/PaymentMenu';

// Moocks for testign
import SubtotalLine from '../components/SalesLayout/SubtotalLine';



const SalesLayout = ({navigation}:{navigation:any}) => {
  // Redux context definitions
  // const catalog = useSelector((state: RootState) => state.productsInventory);

  // Use states
  const [productDevolution, setProductDevolution] = useState<IProductInventory[]>([]);
  const [productReposition, setProductReposition] = useState<IProductInventory[]>([]);
  const [productSale, setProductSale] = useState<IProductInventory[]>([]);
  const [paymnetMethod, setPaymentMethod] = useState<IPaymentMethod>(PAYMENT_METHODS[0]);
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  // Handlers
  const handleStartSalePayment = () => {
    setShowDialog(true);
  }

  const handleConfirmPaymentMethod = () => {
    setConfirmedPaymentMethod(true);
  };

  const handlePaySale = () => {

  };

  const handlerDeclineDialog = () => {
    setShowDialog(false);
    setPaymentMethod(PAYMENT_METHODS[0]);
    setConfirmedPaymentMethod(false);
  };


  return (
    <ScrollView style={tw`w-full flex flex-col`}>
        {/*
          This dialog contais the process for finishing a sale.
          Steps:
            1- Choose a payment method.
            2- Client pays according to its selection.
        */}
        <ActionDialog
          visible={showDialog}
          onAcceptDialog={confirmedPaymentMethod === true ? handlePaySale : handleConfirmPaymentMethod}
          onDeclinedialog={handlerDeclineDialog}
        >
          { confirmedPaymentMethod === true ?
            <PaymentMenu
              total={170}
              paymentMethod={paymnetMethod}/>
              :
            <PaymentMethod
              currentPaymentMethod={paymnetMethod}
              onSelectPaymentMethod={setPaymentMethod}/>
          }
        </ActionDialog>
      <View style={tw`w-full flex flex-1 flex-col items-center`}>
        <View style={tw`w-full flex flex-row`}>
          <TableProduct
            catalog={productInventory}
            commitedProducts={productDevolution}
            setCommitedProduct={setProductDevolution}
            sectionTitle={'Devolución de producto'}
            sectionCaption={'(Precios consultados al día de la venta)'}
            totalMessage={'Total de valor de devolución:'}
            />
        </View>
        <View style={tw`w-full flex flex-row`}>
          <TableProduct
            catalog={productInventory}
            commitedProducts={productReposition}
            setCommitedProduct={setProductReposition}
            sectionTitle={'Reposición de producto'}
            sectionCaption={'(Precios actuales tomados para la reposición)'}
            totalMessage={'Total de valor de la reposición:'}
            />
        </View>
        <View style={tw`flex flex-row my-1`}>
          <SubtotalLine
            description={getMessageForProductDevolutionOperation(productDevolution, productReposition)}
            total={getProductDevolutionBalanceWithoutNegativeNumber(productDevolution,
                   productReposition).toString()}
            fontStyle={'font-bold text-lg'}/>
        </View>
        <View style={tw`flex flex-row w-11/12 border border-solid mt-2`} />
        <View style={tw`w-full flex flex-row`}>
          <TableProduct
            catalog={productInventory}
            commitedProducts={productSale}
            setCommitedProduct={setProductSale}
            sectionTitle={'Productos para vender'}
            sectionCaption={'(Venta sugerida: Última venta)'}
            totalMessage={'Total de la venta:'}
            />
        </View>
        <View style={tw`w-full flex flex-row justify-center my-5`}>
          <SaleSummarize
            productsDevolution={productDevolution}
            productsReposition={productReposition}
            productsSale={productSale}/>
        </View>
      </View>
      <ConfirmationBand
        textOnAccept={'Continuar'}
        textOnCancel={'Cancelar operación'}
        handleOnAccept={handleStartSalePayment}
        handleOnCancel={()=>{}}
      />
    <View style={tw`flex flex-row mt-10`} />
    </ScrollView>
  );
};

export default SalesLayout;
