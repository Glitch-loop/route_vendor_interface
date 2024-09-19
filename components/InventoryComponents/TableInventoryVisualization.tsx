// Libraries
import React from 'react';
import { TextInput, Text, View } from 'react-native';
import { DataTable, ActivityIndicator } from 'react-native-paper';
import tw from 'twrnc';

// Interfaces
import {
  IProductInventory,
  ITransactionDescriptions
 } from '../../interfaces/interfaces';

const TableInventoryOperations = (
  {
    productList,
    initialOperation,
    restockOperations,
    soldOperations,
    repositionsOperations,
    returnedInventory,
    inventoryWithdrawal = false,
    inventoryOutflow = false,
    finalOperation = false,
    issueInventory = false,
  }:{
    productList:IProductInventory[],
    initialOperation:IProductInventory[],
    restockOperations:IProductInventory[][],
    soldOperations: ITransactionDescriptions[],
    repositionsOperations: ITransactionDescriptions[],
    returnedInventory:IProductInventory[],
    inventoryWithdrawal:boolean,
    inventoryOutflow:boolean,
    finalOperation:boolean,
    issueInventory:boolean,
  }) => {

  return (
    <DataTable style={tw`w-full`}>
      {/* Header section */}
      <DataTable.Header>
        {/* This field is never empty since it is necessary anytime */}
        <DataTable.Title style={tw`w-32 flex flex-row justify-center text-center`}>
          <Text style={tw`text-black`}>Producto</Text>
        </DataTable.Title>
        { initialOperation.length > 0 &&
          <DataTable.Title style={tw`w-20 flex flex-row justify-center text-center`}>
            <Text style={tw`text-black`}>Inventario inicial</Text>
          </DataTable.Title>
        }
        { currentInventory.length > 0 &&
          <DataTable.Title style={tw`w-24 flex flex-row justify-center text-center`}>
            <Text style={tw`text-black`}>Re-stock</Text>
          </DataTable.Title>
        }
        {/*
          This field is never empty since it is the reason of this component (inventory operation)
        */}
        { inventoryWithdrawal &&
          <DataTable.Title style={tw`w-28 flex flex-row justify-center text-center`}>
            <Text style={tw`text-black`}>Total producto llevado</Text>
          </DataTable.Title>
        }
        { soldOperations.length > 0 &&
          <DataTable.Title style={tw`w-28 flex flex-row justify-center text-center`}>
            <Text style={tw`text-black`}>Venta</Text>
          </DataTable.Title>
        }
        { repositionsOperations.length > 0 &&
          <DataTable.Title style={tw`w-28 flex flex-row justify-center text-center`}>
            <Text style={tw`text-black`}>Reposición</Text>
          </DataTable.Title>
        }
        { inventoryOutflow &&
          <DataTable.Title style={tw`w-28 flex flex-row justify-center text-center`}>
            <Text style={tw`text-black`}>Total salidas de inventario</Text>
          </DataTable.Title>
        }
        { finalOperation &&
          <DataTable.Title style={tw`w-28 flex flex-row justify-center text-center`}>
            <Text style={tw`text-black`}>Inventario final</Text>
          </DataTable.Title>
        }
        { returnedInventory.length > 0 &&
          <DataTable.Title style={tw`w-28 flex flex-row justify-center text-center`}>
            <Text style={tw`text-black`}>Inventario regresado</Text>
          </DataTable.Title>
        }
        { issueInventory &&
          <DataTable.Title style={tw`w-28 flex flex-row justify-center text-center`}>
            <Text style={tw`text-black`}>Problema con inventario</Text>
          </DataTable.Title>
        }
      </DataTable.Header>
      {/* Body section */}
      { operationInventory.length > 0 ?
        operationInventory.map((product) => {
          // Propierties that are always going to be present.
          let id_product = product.id_product;
          let amount = product.amount;

          // Properties that might not appear
          let suggestedAmount = 0;
          let currentInventoryAmount = 0;

          if (suggestedInventory.length > 0) {
            let foundSuggestedProduct = suggestedInventory.find(suggestedProduct =>
              suggestedProduct.id_product === id_product);

              if (foundSuggestedProduct !== undefined) { suggestedAmount = foundSuggestedProduct.amount; }
          }

          if (currentInventory.length > 0) {
            let foundCurrentInventoryProduct = currentInventory.find(currentInventoryProduct =>
              currentInventoryProduct.id_product === id_product);

            if (foundCurrentInventoryProduct !== undefined)
              { currentInventoryAmount = foundCurrentInventoryProduct.amount; }
          }


          return (
            <DataTable.Row key={product.id_product}>
              {/* This field is never empty since it is necessary anytime */}
              <DataTable.Cell style={tw`w-32  flex flex-row justify-center`}>
                <Text style={tw`text-black`}>{product.product_name}</Text>
              </DataTable.Cell>
              { suggestedInventory.length > 0 &&
                <DataTable.Cell style={tw`w-20 flex flex-row justify-center`}>
                  <Text style={tw`text-black`}>{suggestedAmount}</Text>
                </DataTable.Cell>
              }
              { currentInventory.length > 0 &&
                <DataTable.Cell style={tw`w-24 flex flex-row justify-center`}>
                  <Text style={tw`text-black`}>{currentInventoryAmount}</Text>
                </DataTable.Cell>
              }
              {/*
                This field is never empty since it is the reason of this component (inventory operation)
              */}
              <DataTable.Cell style={tw`w-28 flex flex-row justify-center`}>
                <TextInput
                  style={tw`h-10 w-full 
                    border border-black rounded-lg px-4 bg-slate-100 
                    text-xs text-black text-center`}
                  onChangeText={(amount:string) => handleChangeInventory(id_product, amount)}
                  placeholder={'Cantidad'}
                  keyboardType={'numeric'}
                  />
              </DataTable.Cell>
              { enablingFinalInventory &&
                <DataTable.Cell style={tw`w-28 flex flex-row justify-center`}>
                  <Text style={tw`text-black`}>{ amount + currentInventoryAmount }</Text>
                </DataTable.Cell>
              }
            </DataTable.Row>
          );
        })
        :
        <DataTable.Row>
          <View style={tw`w-full h-full flex flex-col justify-center`}>
            <ActivityIndicator size={'large'} />
          </View>
        </DataTable.Row>
      }
    </DataTable>
  );
};

export default TableInventoryOperations;
