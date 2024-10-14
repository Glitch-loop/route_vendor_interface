import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';
import {
  IProductInventory,
  IRouteTransaction,
  IRouteTransactionOperation,
  IRouteTransactionOperationDescription,
} from '../../interfaces/interfaces';

// Redux context.
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

// Utils
import DAYS_OPERATIONS from '../../lib/day_operations';

// Components
import SectionTitle from '../SalesLayout/SectionTitle';
import SummarizeFormat from './SummarizeFormat';
import TotalsSummarize from '../SalesLayout/TotalsSummarize';

// Services
import { printTicketBluetooth, getPrinterBluetoothConnction } from '../../services/printerService';
import { getTicketSale } from '../../utils/saleFunction';

function convertOperationDescriptionToProductInventoryInterface(
  routeTransactionOperationDescription:IRouteTransactionOperationDescription[]|undefined,
  productInventory: IProductInventory[],
):IProductInventory[] {
  if (routeTransactionOperationDescription === undefined) {
    return [];
  } else {
    return routeTransactionOperationDescription.map((transactionDescription) => {
      const product:IProductInventory = {
        id_product: transactionDescription.id_product,
        product_name: '',
        barcode: '',
        weight: '',
        unit: '',
        comission: 0,
        price: transactionDescription.price_at_moment,
        product_status: 1,
        order_to_show: 0,
        amount: transactionDescription.price_at_moment,
      };

      const foundProduct = productInventory
        .find(currentProduct => { return currentProduct.id_product === transactionDescription.id_product;});

      /* Completing missing spaces */
      if (foundProduct === undefined) {
        /* Do nothing */
      } else {
        product.product_name =    foundProduct.product_name;
        product.barcode =         foundProduct.barcode;
        product.weight =          foundProduct.weight;
        product.unit =            foundProduct.unit;
        product.comission =       foundProduct.comission;
        product.product_status =  foundProduct.product_status;
        product.order_to_show =   foundProduct.order_to_show;
      }

      return product;
    });
  }
}

function getConceptTransactionOperation(idTransactionOperationType:string,
  routeTransactionOperations:IRouteTransactionOperation[]):string {
    let idTransactionOperation = '';

    /*
      Find the operation between all the operations of the transaction according with the
      operation type.

      Remember that at the moment (10-13-24), there are only 3 types of operation that a
      transaction can have:
        - Devolution
        - Reposition
        - Sale
    */
    const foundTransactionOperation = routeTransactionOperations
      .find(transactionOperation => {
          return transactionOperation.id_route_transaction_operation_type ===
          idTransactionOperationType; });

    if (foundTransactionOperation === undefined) {
      /* Do nothing */
    } else {
      idTransactionOperation = foundTransactionOperation.id_route_transaction_operation;
    }

    return idTransactionOperation;
  }

const SummarizeTransaction = ({
  routeTransaction,
  routeTransactionOperations,
  routeTransactionOperationDescriptions,
}:{
  routeTransaction:IRouteTransaction,
  routeTransactionOperations:IRouteTransactionOperation[],
  routeTransactionOperationDescriptions: Map<string,IRouteTransactionOperationDescription[]>,
}) => {
  /* Declaring redux context */
  const productInventory = useSelector((state: RootState) => state.productsInventory);
  /*
    Declaring states to store the movements for each operations.
    At the moment there are only 3 type of operations that a transaction can contain.

    In the declaration of each state, first it is gotten the specific id of the operation according to the type of the state;
    In the first state it is asked for the ID of the operation of the type operation devolution.

    Once the ID is gotten, it is used to get the "description" (or movements) of the operation, this consulting to the map that contains
    all the movements of all the operation of the trasnaction.

    Once it was retrieved the movements for the specific operation, it is converted to the interface that it comes to the IproductIvnetory
    interface.

  */
  const [productsDevolution, setProductsDevolution] =
    useState<IProductInventory[]>(
      convertOperationDescriptionToProductInventoryInterface(
        routeTransactionOperationDescriptions
        .get(getConceptTransactionOperation(DAYS_OPERATIONS.product_devolution, routeTransactionOperations)),
        productInventory)
      );

  const [productsReposition, setProductsReposition] =
    useState<IProductInventory[]>(
      convertOperationDescriptionToProductInventoryInterface(
        routeTransactionOperationDescriptions
        .get(getConceptTransactionOperation(DAYS_OPERATIONS.product_reposition, routeTransactionOperations)),
        productInventory)
    );

  const [productsSale, setProductSale] =
    useState<IProductInventory[]>(
      convertOperationDescriptionToProductInventoryInterface(
        routeTransactionOperationDescriptions
        .get(getConceptTransactionOperation(DAYS_OPERATIONS.sales, routeTransactionOperations)),
        productInventory)
      );

  // Handlers
  const handleOnPrint = async () => {
    try {
      await printTicketBluetooth(getTicketSale(productsDevolution, productsReposition, productsSale));
    } catch(error) {
      await getPrinterBluetoothConnction();
    }
  };

  return (
    <View style={tw`w-full bg-amber-300 border p-2
      flex flex-col justify-center items-center rounded-md`}>
      <SectionTitle
        title={`Operation - ${routeTransaction.date}`}
        caption={''}
        titlePositionStyle={'text-center w-full flex flex-row justify-center'}
      />
      {/* Product devolution section */}
      <SectionTitle
        title={'Devolución de producto'}
        caption={''}
        titlePositionStyle={'text-center w-full flex flex-row justify-center'}
      />
      <SummarizeFormat
        arrayProducts={productsDevolution}
        totalSectionCaptionMessage={'Valor total de devolución: '}/>
      <View style={tw`w-11/12 border`}/>
      {/* Product reposition section */}
      <SectionTitle
        title={'Reposición de producto'}
        caption={''}
        titlePositionStyle={'text-center w-full flex flex-row justify-center'}
        />
      <SummarizeFormat
        arrayProducts={productsReposition}
        totalSectionCaptionMessage={'Valor total de reposición: '}/>
      <View style={tw`w-11/12 border`}/>
      {/* Product sale section */}
      <SectionTitle
        title={'Venta'}
        caption={''}
        titlePositionStyle={'text-center w-full flex flex-row justify-center'}
        />
      <SummarizeFormat
        arrayProducts={productsSale}
            totalSectionCaptionMessage={'Total venta: '}/>
      <View style={tw`w-11/12 border`}/>
      {/* Totals sections */}
      <TotalsSummarize
          productsDevolution={productsDevolution}
          productsReposition={productsReposition}
          productsSale={productsSale}
      />
      <View style={tw`w-full flex flex-row justify-start ml-3`}>
        <Pressable style={
          tw`bg-blue-500 h-14 max-w-32 border border-solid rounded
          flex flex-row basis-1/2 justify-center items-center`}
          onPress={() => {handleOnPrint();}}>
          <Text style={tw`text-center text-black`}>Imprimir</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SummarizeTransaction;
