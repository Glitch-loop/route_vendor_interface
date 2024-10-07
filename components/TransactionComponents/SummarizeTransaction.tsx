import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import {
  IProductInventory,
  IRouteTransaction,
  IRouteTransactionOperation,
  IRouteTransactionOperationDescription,
} from '../../interfaces/interfaces';

import SectionTitle from '../SalesLayout/SectionTitle';
import HeaderProduct from '../SalesLayout/HeaderProduct';
import CardProduct from '../SalesLayout/CardProduct';

import SaleSummarize from '../SalesLayout/SaleSummarize';

const SummarizeTransaction = ({
  routeTransaction,
  routeTransactionOperations,
  routeTransactionOperationDescriptions,
}:{
  routeTransaction:IRouteTransaction,
  routeTransactionOperations:IRouteTransactionOperation[],
  routeTransactionOperationDescriptions: Map<string,IRouteTransactionOperationDescription[]>,
}) => {

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
      <SaleSummarize
        productsDevolution={[]}
        productsReposition={[]}
        productsSale={[]}
      />
      <SectionTitle
        title={'Reposición de producto'}
        caption={''}
        titlePositionStyle={'text-center w-full flex flex-row justify-center'}
      />
      <SectionTitle
        title={'Venta'}
        caption={''}
        titlePositionStyle={'text-center w-full flex flex-row justify-center'}
      />

    </View>
  );
};

export default SummarizeTransaction;
