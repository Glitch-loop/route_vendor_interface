// Librarires
import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

// Interfaces
import { IProductInventory } from '../../interfaces/interfaces';

// Utils
import { getProductDevolutionBalance } from '../../utils/saleFunction';

const TotalsSummarize = ({
  productsDevolution,
  productsReposition,
  productsSale,
  }:{
  productsDevolution:IProductInventory[],
  productsReposition:IProductInventory[],
  productsSale:IProductInventory[]
  }) => {
  let subtotalProductDevolution = getProductDevolutionBalance(productsDevolution,[]);
  let subtotalProductReposition = getProductDevolutionBalance(productsReposition,[]);
  let subtotalSaleProduct = getProductDevolutionBalance(productsSale,[]);
  let productDevolutionBalance = '$0';
  let greatTotal = '$0';

  if (subtotalProductReposition - subtotalProductDevolution < 0) {
    productDevolutionBalance = '-$' + ((subtotalProductReposition - subtotalProductDevolution) * -1).toString();
  } else {
    productDevolutionBalance = '$' + (subtotalProductReposition - subtotalProductDevolution).toString();
  }

  if (subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution < 0) {
    greatTotal = '-$' + ((subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution) * -1).toString();
  } else {
    greatTotal = '$' + (subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution).toString();
  }
  return (
    <View style={tw`w-full my-5 flex flex-col items-end`}>
        <Text style={tw`italic text-base text-black`}>
          Valor total de devolución de producto: -${subtotalProductDevolution}
        </Text>
        <Text style={tw`italic text-base text-black`}>
          Valor total de reposición de producto: ${subtotalProductReposition}
        </Text>
        <Text style={tw`italic text-base text-black font-bold`}>
          Balance de devolución de producto: { productDevolutionBalance }
        </Text>
        <View style={tw`flex flex-row w-10/12 border border-solid mt-2`} />
        <Text style={tw`italic text-base text-black`}>
          Balance de devolución de producto: { productDevolutionBalance }
        </Text>
        <Text style={tw`italic text-base text-black`}>
          Total de venta: ${ subtotalSaleProduct }
        </Text>
        <Text style={tw`italic text-base font-bold text-black`}>Gran total: { greatTotal } </Text>
    </View>
  );
};

export default TotalsSummarize;
