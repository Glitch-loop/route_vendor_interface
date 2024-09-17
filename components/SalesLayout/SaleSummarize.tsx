// Libraries
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import tw from 'twrnc';

// Interfaces and utils
import { IProductInventory } from '../../interfaces/interfaces';
import { getProductDevolutionBalance, getProductDevolutionBalanceWithoutNegativeNumber } from '../../utils/saleFunction';

// Components
import SubtotalLine from './SubtotalLine';

function combineCommitedProduct(
  productSale:IProductInventory[],
  productReposition:IProductInventory[]):IProductInventory[][] {
    const combinedCommitedProduct:IProductInventory[][] = [];


    // Populate the matrix with the products of the first list
    productSale.forEach(product => {
      combinedCommitedProduct.push([
        product, // Sale product
        {
          ...product,
          amount: 0,
        }, // Reposition product
      ]);
    });

    /*
      If the product already exist in the matrix, store it in the position of the product,
      otherwise create a new record.
    */

    productReposition.forEach(product => {
      // Search if the product already exists.
      const index:number = combinedCommitedProduct.findIndex(commitedProduct => {
        return commitedProduct[0].id_product === product.id_product;
      });

      if (index === -1) { // New product
        combinedCommitedProduct.push([
          {
            ...product,
            amount: 0,
          }, // Sale product
          product, // Reposition product
        ]);
      } else { // Exisiting product
        combinedCommitedProduct[index] = [
          { ...combinedCommitedProduct[index][0] }, // Sale product
          { ...product }, // Reposition product
        ];
      }
    });
    return combinedCommitedProduct;
  }

const SaleSummarize = ({
    productsDevolution,
    productsReposition,
    productsSale,
  }:{
    productsDevolution:IProductInventory[],
    productsReposition:IProductInventory[],
    productsSale:IProductInventory[],
  }) => {

    /*
      At least for this component, the matriz is going to work like this:
      [[saleProduct][repositionProduct]]
    */
    const [summarizeProduct, setSummarizeProduct] =
      useState<IProductInventory[][]>(combineCommitedProduct(productsSale, productsReposition));


    useEffect(() => {
      setSummarizeProduct(combineCommitedProduct(productsSale, productsReposition));
    }, [productsSale, productsReposition]);

  return (
    <View style={tw`w-11/12 flex flex-col items-center`}>
      <Text style={tw`w-full text-black text-2xl text-left`}>Resumen</Text>

      {/* Product devolution section */}

      <Text
        style={tw`my-1 w-full text-black font-bold text-lg flex flex-row text-center items-center justify-center`}>
        Devolución de producto
      </Text>
      <View style={tw`w-full flex flex-row items-center`}>
        <Text style={tw`flex basis-1/4 font-bold text-center text-black`}>Producto</Text>
        <Text style={tw`flex basis-1/4 font-bold text-center text-black`}>Precio</Text>
        <Text style={tw`flex basis-1/4 font-bold text-center text-black`}>Cantidad</Text>
        <Text style={tw`flex basis-1/4 font-bold text-center text-black`}>Valor</Text>
      </View>
      { productsDevolution.length > 0 ? (
        productsDevolution.map(product => {
        return (
          <View key={product.id_product} style={tw`w-full my-1 flex flex-row items-center`}>
            <Text style={tw`flex basis-1/4 text-center text-black`}>{product.product_name}</Text>
            <Text style={tw`flex basis-1/4 text-center text-black`}>${product.price}</Text>
            <Text style={tw`flex basis-1/4 text-center text-black`}>{product.amount}</Text>
            <Text style={tw`flex basis-1/4 text-center text-black`}>
              ${product.amount * product.price}
            </Text>
          </View>
        );})
        ) : (
          <Text style={tw`text-black text-xl text-center mt-3`}>
            No se ha seleccionado ningún producto
          </Text>
      )}
      {/* Getting subtotal product devolution */}
      { productsDevolution.length > 0 &&
        <SubtotalLine
          description={'Total devolución de producto:'}
          total={getProductDevolutionBalanceWithoutNegativeNumber(productsDevolution,
                  []).toString()}
          fontStyle={'font-bold italic text-base'}/>
      }

      {/* Selling and product reposition section */}

      <Text
        style={tw`mt-3 mb-1 w-full text-black font-bold text-lg flex flex-row text-center items-center justify-center`}>
        Venta y reposición
      </Text>
      <ScrollView
        horizontal={true}>
        <View style={tw`flex flex-col`}>
          <View style={tw`flex flex-row items-center justify-around`}>
            <View style={tw`w-24 flex`}>
              <Text style={tw`font-bold text-center text-black`}>Producto</Text>
            </View>
            <View style={tw`w-16 flex`}>
              <Text style={tw`font-bold text-center text-black`}>Precio</Text>
            </View>
            <View style={tw`w-24 flex`}>
              <Text style={tw`font-bold text-center text-black`}>Venta</Text>
            </View>
            <View style={tw`w-24 flex`}>
              <Text style={tw`font-bold text-center text-black`}>Subtotal (venta)</Text>
            </View>
            <View style={tw`w-24 flex`}>
              <Text style={tw`font-bold text-center text-black`}>Reposición</Text>
            </View>
            <View style={tw`w-24 flex`}>
              <Text style={tw`font-bold text-center text-black`}>Subtotal Reposición</Text>
            </View>
            <View style={tw`w-24 flex`}>
              <Text style={tw`font-bold text-center text-black`}>Total (producto)</Text>
            </View>
          </View>

          { summarizeProduct.length > 0 ? (
          summarizeProduct.map(product => {
          return (
            <View key={product[0].id_product} style={tw`w-full my-1 flex flex-row items-center`}>
              {/* Information related for both concepts */}
              <View style={tw`w-24 flex`}>
                <Text style={tw`text-center text-black`}>{product[0].product_name}</Text>
              </View>

              {/* Information related to the sales */}

              <View style={tw`w-16 flex`}>
                <Text style={tw`text-center text-black`}>${product[0].price}</Text>
              </View>
              <View style={tw`w-24 flex`}>
                <Text style={tw`text-center text-black`}>{product[0].amount}</Text>
              </View>
              <View style={tw`w-24 flex`}>
                <Text style={tw`text-center text-black`}>
                  ${product[0].price * product[0].amount}
                </Text>
              </View>

              {/* Information related to the reposition */}

              <View style={tw`w-24 flex`}>
                <Text style={tw`flex basis-1/12 text-center text-black`}>
                  {product[1].amount}
                </Text>
              </View>
              <View style={tw`w-24 flex`}>
                <Text style={tw`text-center text-black`}>
                  ${product[1].price * product[1].amount}
                </Text>
              </View>
              <View style={tw`w-24 flex`}>
                <Text style={tw`underline font-bold text-center text-black`}>
                  {product[0].amount + product[1].amount}
                </Text>
              </View>
            </View>
          );})
          ) : (
            <Text style={tw`text-black text-xl text-center mt-3`}>
              No se ha seleccionado ningún producto
            </Text>
          )}
          {/* Getting totals for each concept */}
          { summarizeProduct.length > 0 &&
            <View style={tw`flex flex-row items-center justify-around`}>
                {/* Product name */}
                <View style={tw`w-24 flex`} />
                {/* Price */}
                <View style={tw`w-16 flex`} />
                {/* Sale amount */}
                <View style={tw`w-24 flex`}>
                  <Text style={tw`font-bold italic text-base`}>Subtotal venta: </Text>
                </View>
                {/* Sale Subtotal */}
                <View style={tw`w-24 flex`}>
                  <Text style={tw`font-bold italic text-base text-center`}>
                    ${getProductDevolutionBalanceWithoutNegativeNumber(productsSale, [])}
                  </Text>
                </View>
                {/* Reposition amount */}
                <View style={tw`w-24 flex`}>
                  <Text style={tw`font-bold italic text-base`}>Subtotal reposición: </Text>
                </View>
                {/* Reposition subtotal */}
                <View style={tw`w-24 flex`}>
                  <Text style={tw`font-bold italic text-base text-center`}>
                    ${getProductDevolutionBalanceWithoutNegativeNumber([], productsReposition)}
                  </Text>
                </View>
                {/* Total product amount amount */}
                <View style={tw`w-24 flex`} />
            </View>
          }
        </View>
      </ScrollView>

      {/* Billing section */}
      {
        (() => {
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
                <Text style={tw`italic text-base`}>
                  Valor total de devolución de producto: -${subtotalProductDevolution}
                </Text>
                <Text style={tw`italic text-base`}>
                  Valor total de reposición de producto: ${subtotalProductReposition}
                </Text>
                <Text style={tw`italic text-base font-bold`}>
                  Balance de devolución de producto: { productDevolutionBalance }
                </Text>
                <View style={tw`flex flex-row w-10/12 border border-solid mt-2`} />
                <Text style={tw`italic text-base`}>
                  Balance de devolución de producto: { productDevolutionBalance }
                </Text>
                <Text style={tw`italic text-base`}> Total de venta: ${ subtotalSaleProduct } </Text>
                <Text style={tw`italic text-base font-bold`}>Gran total: { greatTotal } </Text>
            </View>
          );
        })()
      }
    </View>
  );
};

export default SaleSummarize;
