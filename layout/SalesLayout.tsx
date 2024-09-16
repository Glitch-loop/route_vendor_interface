// Libraries
import React, { useState } from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import TableProduct from '../components/SalesLayout/TableProduct';

// Redux context.
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';

// Moocks for testign
import productInventory from '../moocks/productInventory';
import { IProductInventory } from '../interfaces/interfaces';

const SalesLayout = ({navigation}:{navigation:any}) => {
  // Redux context definitions
  // const catalog = useSelector((state: RootState) => state.productsInventory);

  // Use states
  const [productDevolution, setProductDevolution] = useState<IProductInventory[]>([]);
  const [productReposition, setProductReposition] = useState<IProductInventory[]>([]);
  const [productSale, setProductSale] = useState<IProductInventory[]>([]);


  return (
    <View style={tw`w-full flex-1 items-center`}>
      <TableProduct
        catalog={productInventory}
        commitedProducts={productDevolution}
        setCommitedProduct={setProductDevolution}
        />
    </View>
  );
};

export default SalesLayout;
