// Libraries
import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import tw from 'twrnc';

// Interfaces and utils
import { IProductInventory } from '../../interfaces/interfaces';
import { getProductDevolutionBalanceWithoutNegativeNumber } from '../../utils/saleFunction';

// Components
import SubtotalLine from '../SalesLayout/SubtotalLine';

/*
  Although this component is more related to "transaction summrizing",
  it was decided to use the IProductInventory interface because it is more used than
  the transaction interfaces (so, in this way, it is expected that with this decisition
  this component be more reusable).
*/

const SummarizeFormat = ({
    arrayProducts,
    totalSectionCaptionMessage = 'Total: ',
    emptyMovementCaption = 'Ningún movimiento en la operación',
  }:{
    arrayProducts:IProductInventory[],
    totalSectionCaptionMessage?:string,
    emptyMovementCaption?: string,
  }) => {
  return (
    <View style={tw`w-11/12 flex flex-col items-center`}>
      <View style={tw`w-full flex flex-row items-center`}>
        <Text style={tw`flex basis-1/4 font-bold text-center text-black`}>Producto</Text>
        <Text style={tw`flex basis-1/4 font-bold text-center text-black`}>Precio</Text>
        <Text style={tw`flex basis-1/4 font-bold text-center text-black`}>Cantidad</Text>
        <Text style={tw`flex basis-1/4 font-bold text-center text-black`}>Valor</Text>
      </View>
      { arrayProducts.length > 0 ? (
        arrayProducts.map(product => {
        return (
          <View key={product.id_product} style={tw`w-full my-1 flex flex-row items-center`}>
            <Text style={tw`flex basis-1/4 text-center text-black`}>
              {product.product_name}
            </Text>
            <Text style={tw`flex basis-1/4 text-center text-black`}>${product.price}</Text>
            <Text style={tw`flex basis-1/4 text-center text-black`}>{product.amount}</Text>
            <Text style={tw`flex basis-1/4 text-center text-black`}>
              ${product.amount * product.price}
            </Text>
          </View>
        );})
        ) : (
          <Text style={tw`text-black text-xl text-center mt-3`}>
            {emptyMovementCaption}
          </Text>
      )}
      {/* Getting subtotal product devolution */}
      { arrayProducts.length > 0 &&
        <SubtotalLine
          description={totalSectionCaptionMessage}
          total={getProductDevolutionBalanceWithoutNegativeNumber(arrayProducts,
                  []).toString()}
          fontStyle={'font-bold italic text-base'}/>
      }
    </View>
  );
};

export default SummarizeFormat;
