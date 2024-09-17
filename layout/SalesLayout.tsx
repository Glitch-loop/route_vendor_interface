// Libraries
import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import tw from 'twrnc';

// Redux context.
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';

// Interfaces and utils
import { IProductInventory } from '../interfaces/interfaces';
import {
  getMessageForProductDevolutionOperation,
  getProductDevolutionBalanceWithoutNegativeNumber,
} from '../utils/saleFunction';

// Components
import productInventory from '../moocks/productInventory';
import TableProduct from '../components/SalesLayout/TableProduct';
import SaleSummarize from '../components/SalesLayout/SaleSummarize';
import ConfirmationBand from '../components/ConfirmationBand';
import ActiononDialog from '../components/ActionDialog';
import PaymentMethod from '../components/SalesLayout/PaymentMethod';

// Moocks for testign
import SubtotalLine from '../components/SalesLayout/SubtotalLine';
import PaymentMenu from '../components/SalesLayout/PaymentMenu';



const SalesLayout = ({navigation}:{navigation:any}) => {
  // Redux context definitions
  // const catalog = useSelector((state: RootState) => state.productsInventory);

  // Use states
  const [productDevolution, setProductDevolution] = useState<IProductInventory[]>([]);
  const [productReposition, setProductReposition] = useState<IProductInventory[]>([]);
  const [productSale, setProductSale] = useState<IProductInventory[]>([]);


  return (
    <ScrollView style={tw`w-full flex flex-col`}>
        <ActiononDialog
          visible={true}
          setVisible={() => {}}
          message={""}
          confirmation={()=>{}}
        >
          {/* <PaymentMethod /> */}
          <PaymentMenu
            total={170}
            paymentMethod={
              {
                id_payment_method: '52757755-1471-44c3-b6d5-07f7f83a0f6f',
                payment_method_name: 'Efectivo',
              }
            }
            />
        </ActiononDialog>
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
        handleOnAccept={()=>{}}
        handleOnCancel={()=>{}}
      />
    <View style={tw`flex flex-row mt-10`} />
    </ScrollView>
  );
};

export default SalesLayout;
