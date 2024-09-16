// Libraries
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import tw from 'twrnc';
import TableProduct from '../components/SalesLayout/TableProduct';

// Redux context.
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';

// Moocks for testign
import productInventory from '../moocks/productInventory';
import { IProductInventory } from '../interfaces/interfaces';
import SubtotalLine from '../components/SalesLayout/SubtotalLine';

// Auxiliar functuion
function getProductDevolutionBalance(productDevolution:IProductInventory[], productReposition:IProductInventory[]):number {
  const totalProductDevolution = productDevolution.reduce((acc,item) =>
    {return acc + item.price * item.amount;}, 0);

  const totalProductReposition = productReposition.reduce((acc, item) =>
    {return acc + item.price * item.amount;}, 0);

  return totalProductDevolution - totalProductReposition;
}

function getProductDevolutionBalanceWithoutNegativeNumber(productDevolution:IProductInventory[], productReposition:IProductInventory[]) {
  let total = getProductDevolutionBalance(productDevolution, productReposition);
  if (total < 0) {
    return total * -1;
  } else {
    return total;
  }
}

function getMessageForProductDevolutionOperation(productDevolution:IProductInventory[], productReposition:IProductInventory[]) {
  let total = getProductDevolutionBalance(productDevolution, productReposition);
  if (total < 0) {
    return 'Balance de la devolución de producto (por cobrar): ';
  } else {
    return 'Balance de la devolución de producto (a pagar): ';
  }
}

const SalesLayout = ({navigation}:{navigation:any}) => {
  // Redux context definitions
  // const catalog = useSelector((state: RootState) => state.productsInventory);

  // Use states
  const [productDevolution, setProductDevolution] = useState<IProductInventory[]>([]);
  const [productReposition, setProductReposition] = useState<IProductInventory[]>([]);
  const [productSale, setProductSale] = useState<IProductInventory[]>([]);


  return (
    <ScrollView style={tw`w-full flex flex-col`}>
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
        <View style={tw`flex flex-row mt-10`} />
      </View>
    </ScrollView>
  );
};

export default SalesLayout;
