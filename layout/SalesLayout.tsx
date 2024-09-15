// Libraries
import React from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import TableProduct from '../components/SalesLayout/TableProduct';

// Redux context.
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';

const SalesLayout = ({navigation}:{navigation:any}) => {
  // Redux context definitions
  const catalog = useSelector((state: RootState) => state.productsInventory);
  return (
    <View style={tw`w-full flex-1 items-center`}>
      <TableProduct
        catalog={catalog}/>
    </View>
  );
};

export default SalesLayout;
