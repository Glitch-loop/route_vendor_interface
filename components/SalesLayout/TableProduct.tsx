// Libraries
import React from 'react';
import { View } from 'react-native';
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
    sectionTitle,
    sectionCaption,
    totalMessage,
  }:{
    catalog:IProductInventory[],
    commitedProducts:IProductInventory[],
    setCommitedProduct:any,
    sectionTitle:string,
    sectionCaption: string,
    totalMessage: string,
  }) => {

    // Handlers
    const onSelectAnItem = (selectedItem:IProductInventory) => {
      const newItem:IProductInventory = {
        ...selectedItem,
      };

      //Avoiding duplicates
      const foundItem:IProductInventory|undefined = commitedProducts.find(product => {
        return product.id_product === selectedItem.id_product;
      });

      if (foundItem === undefined) {
        newItem.amount = 1;

        setCommitedProduct([
          ...commitedProducts,
          {...newItem},
        ]);
      }
    };

    const handleOnChangeAmount = (changedItem:IProductInventory, newAmount:number) => {
      const updatedCommitedProducts = commitedProducts.map(product => {
        if (product.id_product === changedItem.id_product) {
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

    const handleOnDelteItem = (deleteItem:IProductInventory) => {
      const updatedCommitedProducts = commitedProducts.filter(product =>
        product.id_product !== deleteItem.id_product);
      setCommitedProduct(updatedCommitedProducts);
    };

  return (
    <View style={tw`w-full flex-1 items-center`}>
      <View style={tw`w-full mt-3 flex flex-row justify-center`}>
        <SearchBarWithSuggestions
          selectedCatalog={commitedProducts}
          catalog={catalog}
          fieldToSearch={'product_name'}
          keyField={'id_product'}
          onSelectHandler={onSelectAnItem}
          />
      </View>
      <SectionTitle
        title={sectionTitle}
        caption={sectionCaption}
        titlePositionStyle={'justify-center items-center my-2'}/>
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
              onDeleteItem={handleOnDelteItem}
            />
          </View>
        )
      }
      <SubtotalLine
        description={totalMessage}
        total={
          commitedProducts.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.amount * currentValue.price;
          }, 0).toString()
        }
        fontStyle={'font-bold text-lg'}
      />
      <View style={tw`w-11/12 border border-solid mt-2`} />
    </View>
  );
};

export default TableProduct;
