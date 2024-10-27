// Librarires
import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

// Interfaces
import { IProductInventory, IRouteTransaction } from '../../interfaces/interfaces';

// Utils
import { getProductDevolutionBalance, getPaymentMethod, calculateChange } from '../../utils/saleFunction';
import PAYMENT_METHODS from '../../utils/paymentMethod';

const TotalsSummarize = ({
  routeTransaction,
  productsDevolution,
  productsReposition,
  productsSale,
  }:{
  routeTransaction?:IRouteTransaction
  productsDevolution:IProductInventory[],
  productsReposition:IProductInventory[],
  productsSale:IProductInventory[]
  }) => {
  let subtotalProductDevolution = getProductDevolutionBalance(productsDevolution,[]);
  let subtotalProductReposition = getProductDevolutionBalance(productsReposition,[]);
  let subtotalSaleProduct = getProductDevolutionBalance(productsSale,[]);
  let productDevolutionBalance = '$0';
  let greatTotal = '$0';
  let cashReceived = '$0';
  let greatTotalNumber = (subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution);

  // Getting product devolution balance
  if (subtotalProductReposition - subtotalProductDevolution < 0) {
    productDevolutionBalance = '-$' + ((subtotalProductReposition - subtotalProductDevolution) * -1).toString();
  } else {
    productDevolutionBalance = '$' + (subtotalProductReposition - subtotalProductDevolution).toString();
  }

  // Getting great total of the operation
  if (subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution < 0) {
    greatTotal = '-$' + ((subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution) * -1).toString();
  } else {
    greatTotal = '$' + greatTotalNumber.toString();
  }

  if (routeTransaction === undefined) {
    /* Do nothing */
  } else {
    if (routeTransaction.cash_received < 0) {
      cashReceived = '$' + (routeTransaction.cash_received * -1).toString();
    } else {
      cashReceived = '$' + (routeTransaction.cash_received).toString();
    }
  }

  return (
    <View style={tw`w-full my-5 flex flex-col justify-center items-center`}>
      <View style={tw`w-full flex flex-row`}>
        <Text style={tw`flex basis-4/6 italic text-base text-black text-right italic`}>
          Valor total de devolución de producto:
        </Text>
        <Text style={tw`flex basis-2/6 italic text-base text-black text-center align-middle italic`}>
          -${subtotalProductDevolution}
        </Text>
      </View>
      <View style={tw`w-full flex flex-row`}>
        <Text style={tw`flex basis-4/6 italic text-base text-black text-right italic`}>
          Valor total de reposición de producto:
        </Text>
        <Text style={tw`flex basis-2/6 italic text-base text-black text-center align-middle italic`}>
          ${subtotalProductReposition}
        </Text>
      </View>
      <View style={tw`w-full flex flex-row`}>
        <Text style={tw`flex basis-4/6 italic text-base text-black text-right font-bold italic`}>
          Balance de devolución de producto:
        </Text>
        <Text
          style={tw`flex basis-2/6 italic text-base text-black text-center align-middle font-bold italic`}>
          { productDevolutionBalance }
        </Text>
      </View>
      <View style={tw`flex flex-row w-11/12 border border-solid mt-2`} />
      <View style={tw`w-full flex flex-row`}>
        <Text style={tw`flex basis-4/6 italic text-base text-black text-right italic`}>
          Balance de devolución de producto:
        </Text>
        <Text style={tw`flex basis-2/6 italic text-base text-black text-center align-middle italic`}>
          { productDevolutionBalance }
        </Text>
      </View>
      <View style={tw`w-full flex flex-row`}>
        <Text style={tw`flex basis-4/6 italic text-base text-black text-right italic`}>
          Total de venta:
        </Text>
        <Text style={tw`flex basis-2/6 italic text-base text-black text-center align-middle italic`}>
          ${ subtotalSaleProduct }
        </Text>
      </View>
      <View style={tw`w-full flex flex-row`}>
        <Text style={tw`flex basis-4/6 italic text-base text-black text-right font-bold italic`}>
          Gran total:
        </Text>
        <Text style={tw`flex basis-2/6 italic text-base text-black text-center align-middle font-bold italic`}>
          { greatTotal }
        </Text>
      </View>
      { routeTransaction !== undefined &&
        <View style={tw`w-full flex flex-row`}>
          <Text style={tw`flex basis-4/6 italic text-base text-black text-right font-bold italic`}>
            Metodo de pago {`(${getPaymentMethod(routeTransaction,PAYMENT_METHODS).payment_method_name})`}:
          </Text>
          <Text style={tw`flex basis-2/6 italic text-base text-black text-center align-middle font-bold italic`}>
            { cashReceived }
          </Text>
        </View>
      }
      { routeTransaction !== undefined &&
        <View style={tw`w-full flex flex-row`}>
          <Text style={tw`flex basis-4/6 italic text-base text-black text-right font-bold italic`}>
            Cambio:
          </Text>
          <Text style={tw`flex basis-2/6 italic text-base text-black text-center align-middle font-bold italic`}>
            ${ calculateChange(greatTotalNumber, routeTransaction.cash_received) }
          </Text>
        </View>
      }
    </View>
  );
};

export default TotalsSummarize;
