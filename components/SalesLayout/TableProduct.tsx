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
    commitedProducts,
    setCommitedProduct,
  }:{
    catalog:IProductInventory[],
    commitedProducts:IProductInventory[],
    setCommitedProduct:any
  }) => {

    // Handlers
    const onSelectAnItem = (selectedItem:IProductInventory) => {
      //Avoiding duplicates
      const foundItem = commitedProducts.find(product => {
        return product.id_product === selectedItem.id_product;
      });

      if (foundItem === undefined) {
        setCommitedProduct([...commitedProducts, selectedItem]);
      }
    };

    const handleOnChangeAmount = (changedItem:IProductInventory, newAmount:number) => {
      const updatedCommitedProducts = commitedProducts.map(product => {
        if (product.id_product === changedItem.id_product) {
          console.log("New amount: ", newAmount)
          return {
            ...changedItem,
            amount: newAmount,
          };
        } else {
          return product;
        }
      });
      setCommitedProduct(updatedCommitedProducts);
    };

  return (
    <View style={tw`w-full flex-1 items-center`}>
      <SearchBarWithSuggestions
        catalog={catalog}
        fieldToSearch={'product_name'}
        keyField={'id_product'}
        onSelectHandler={onSelectAnItem}
        />
      <SectionTitle
        title={'Productos para vender'}
        caption={'(Venta sugerida: Última venta)'}
        titlePositionStyle={'justify-center items-center'}/>
      <HeaderProduct />
      { commitedProducts.length > 0 &&
        commitedProducts.map(product =>
          <View
            style={tw`my-1`}
            key={product.id_product}>
            <CardProduct
              productName={product.product_name}
              price={product.price}
              amount={product.amount}
              subtotal={product.price * product.amount}
              item={product}
              onChangeAmount={handleOnChangeAmount}
            />
          </View>
        )
      }
      <SubtotalLine
        description={'Total de la venta:'}
        total={
          commitedProducts.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.amount * currentValue.price;
          }, 0).toString()
        }
        fontStyle={'font-bold text-lg'}
      />
      <View style={tw`w-11/12 border border-solid`} />
    </View>
  )
};

export default TableProduct;
