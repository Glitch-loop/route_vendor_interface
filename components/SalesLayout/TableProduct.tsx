// Libraries
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

// Components
import CardProduct from './CardProduct';
import SectionTitle from './SectionTitle';
import SubtotalLine from './SubtotalLine';
import HeaderProduct from './HeaderProduct';
import SearchBarWithSuggestions from './SearchBarWithSuggestions';

import { IProductInventory } from '../../interfaces/interfaces';

const TableProduct = ({
    catalog,
  }:{
    catalog:IProductInventory[]
  }) => {
  return (
    <View style={tw`w-full flex-1 items-center`}>
      <SearchBarWithSuggestions
        catalog={catalog}
        fieldToSearch={'product_name'}/>
      <SectionTitle
        title={'Productos para vender'}
        caption={'(Venta sugerida: Última venta)'}
        titlePositionStyle={'justify-center items-center'}/>
      <HeaderProduct />
      <CardProduct
        productName={'Cacahuate salado'}
        price={'7.5'}
        amount={'4'}
        subtotal={'30'}
      />
      <SubtotalLine
        description={'Total de la venta:'}
        total={'125'}
        fontStyle={'font-bold text-lg'}
      />
      <View style={tw`w-11/12 border border-solid`}></View>
    </View>
  )
};

export default TableProduct;
