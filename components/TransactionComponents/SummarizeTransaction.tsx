import React, { useState } from 'react';
import { View } from 'react-native';
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
import SummarizeFormat from './summarizeFormat';


function convertTransactionOperationDescriptionToProductInventoryInterface(
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

function getConceptTransactionOperation(
  idTransactionOperationType:string,
  routeTransactionOperations:IRouteTransactionOperation[]):string {
    let idTransactionOperation = '';

    const foundTransactionOperation = routeTransactionOperations
      .find(transactionOperation => {
        return transactionOperation.id_route_transaction_operation_type === idTransactionOperationType;
      });

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
  console.log(routeTransactionOperations[0].id_route_transaction_operation_type)
  console.log(routeTransactionOperations[1].id_route_transaction_operation_type)
  console.log(routeTransactionOperations[2].id_route_transaction_operation_type)
  /*
    Declaring states
    At the moment there are only 3 type of operations that a transaction can contain
  */
  const [idProductDevolution, setIdProductDevolution] = useState<string>(getConceptTransactionOperation(
      DAYS_OPERATIONS.product_devolution, routeTransactionOperations));

  const [idProductReposition, setIdProductReposition] = useState<string>(getConceptTransactionOperation(
    DAYS_OPERATIONS.product_reposition, routeTransactionOperations));

  const [idProductSale, setIdProductSale] = useState<string>(getConceptTransactionOperation(
    DAYS_OPERATIONS.sales, routeTransactionOperations));


  return (
    <View style={tw`w-full flex flex-col`}>
      <SectionTitle
        title={`Operation - ${routeTransaction.date}`}
        caption={''}
        titlePositionStyle={'text-center w-full flex flex-row justify-center'}
      />
      <SectionTitle
        title={'Devolución de producto'}
        caption={''}
        titlePositionStyle={'text-center w-full flex flex-row justify-center'}
      />
      <SummarizeFormat
        arrayProducts={
          convertTransactionOperationDescriptionToProductInventoryInterface(
            routeTransactionOperationDescriptions.get(idProductDevolution),
            productInventory)}/>
      <SectionTitle
        title={'Reposición de producto'}
        caption={''}
        titlePositionStyle={'text-center w-full flex flex-row justify-center'}
        />
      <SummarizeFormat
        arrayProducts={
          convertTransactionOperationDescriptionToProductInventoryInterface(
            routeTransactionOperationDescriptions.get(idProductReposition),
            productInventory)}/>
      <SectionTitle
        title={'Venta'}
        caption={''}
        titlePositionStyle={'text-center w-full flex flex-row justify-center'}
        />
      <SummarizeFormat
        arrayProducts={
          convertTransactionOperationDescriptionToProductInventoryInterface(
            routeTransactionOperationDescriptions.get(idProductSale),
            productInventory)}/>
    </View>
  );
};

export default SummarizeTransaction;
