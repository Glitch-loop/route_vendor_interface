// Libraries
import React from 'react';
import { Text, View } from 'react-native';
import { DataTable, ActivityIndicator } from 'react-native-paper';
import tw from 'twrnc';

// Interfaces
import { IDayOperation, IProductInventory } from '../../interfaces/interfaces';
import AutomatedCorrectionNumberInput from '../generalComponents/AutomatedCorrectionInput';
import DAYS_OPERATIONS from '../../lib/day_operations';

/*
  The intnetion of this component is to provide an interface to perform an inventory operation.
  At the moment of write this documentation there are 4 possible operations:
  - Start inventory
  - Restock inventory
  - Product inventory
  - Final inventory

  All of them implies to receive/deliver product, depending on the context of how the inventory operation
  is performed is how it is going to impact in the vendor's inventory.

  This component recieves these parameters:
    - suggestedInventory: Suggestion for the vendor to take product for the route (informative).
    - currentInventory: The current vendor's inventory.
    - operationInventory: The inventory that vendor's is taking for the route.
    - enablingFinalInventory: The addition between the current inventory and what the vendor is currently taking.
    - setInventoryOperation: Handler to update "inventory operation".

  Note: If you pass "[]" (empty) array, it will be taking as there is not information (this option was preferred
  over the "undefined" one).

  Note: The param on which the component build the table is "operationInventory" (the information of the other arrays
  display its information around "operationInventory").
*/


function foundCurrentProductInArray(arrProduct: IProductInventory[], current_id_product: string):number {
  let resultAmount = 0;
  if (arrProduct.length > 0) {
    let foundSuggestedProduct = arrProduct.find(suggestedProduct =>
      suggestedProduct.id_product === current_id_product);

      if (foundSuggestedProduct !== undefined) {
        resultAmount = foundSuggestedProduct.amount;
      } else {
        resultAmount = 0;
      }
  } else {
    resultAmount =  0;
  }

  return resultAmount;
}

function determineFlowOfProduct(operation:IDayOperation) {
  let result:boolean = true;
  if (operation.id_type_operation === DAYS_OPERATIONS.product_devolution_inventory) {
    result = false; // It is an inflow of product from the factory
  } else {
    result = true; // It is an outflow of product from the factory
  }

  return result;
}

const TableInventoryOperations = (
  {
    suggestedInventory,
    currentInventory,
    operationInventory,
    setInventoryOperation,
    currentOperation,
  }:{
    suggestedInventory:IProductInventory[],
    currentInventory:IProductInventory[],
    operationInventory:IProductInventory[],
    setInventoryOperation:any,
    currentOperation:IDayOperation,
  }) => {
    let outflowProductFromFactory:boolean = determineFlowOfProduct(currentOperation);
  return (
    <DataTable style={tw`w-full`}>
      {/* Header section */}
      <DataTable.Header>
        {/* This field is never empty since it is necessary anytime */}
        <DataTable.Title style={tw`w-32 flex flex-row justify-center`}>
          <Text style={tw`text-black text-center`}>Producto</Text>
        </DataTable.Title>
        { suggestedInventory.length > 0 &&
          <DataTable.Title style={tw`w-20 flex flex-row justify-center`}>
            <Text style={tw`text-black text-center`}>Sugerido</Text>
          </DataTable.Title>
        }
        { currentInventory.length > 0 &&
          <DataTable.Title style={tw`w-24 flex flex-row justify-center`}>
            <Text style={tw`text-black text-center`}>Inventario Actual</Text>
          </DataTable.Title>
        }
        {/*
          This field is never empty since it is the reason of this component (inventory operation)
        */}
        <DataTable.Title style={tw`w-28 flex flex-row justify-center`}>
          <View style={tw`max-w-20`}>
            <Text style={tw`text-black text-center`}>
              { outflowProductFromFactory ?
                'Producto a recibir' :
                'Producto a entregar'
              }
            </Text>
          </View>
        </DataTable.Title>
        <DataTable.Title style={tw`w-28 flex flex-row justify-center`}>
          <View style={tw`max-w-20`}>
            <Text style={tw`text-black text-center`}>
              { outflowProductFromFactory ?
                'Inventario total' :
                'Inventario a entregar'
              }
            </Text>
          </View>
        </DataTable.Title>
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

          // Searching products for each array
          suggestedAmount = foundCurrentProductInArray(suggestedInventory, id_product);
          currentInventoryAmount = foundCurrentProductInArray(currentInventory, id_product);

          // Handlers
          const handlerChangeInventory = (input: number) => {
            // Creating a copy og the inventory operation.
            const updatedInventory: IProductInventory[] = [...operationInventory];

            // Looking for the product to update.
            const index:number = operationInventory
              .findIndex((productOperationInventory:IProductInventory) => productOperationInventory.id_product === id_product);

            if (index !== -1) { // The product exists in the inventory.
              const updatedProduct = { ...updatedInventory[index], amount: input };

              updatedInventory[index] = updatedProduct;

              setInventoryOperation(updatedInventory);
            } else {
              /* The product is not in the inventory */
            }
          };

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
              <DataTable.Cell style={tw`w-28 flex flex-row justify-center`}>
                <View style={tw`w-8/12`}>
                  <AutomatedCorrectionNumberInput
                    amount={amount}
                    onChangeAmount={handlerChangeInventory}/>
                </View>
              </DataTable.Cell>
                <DataTable.Cell style={tw`w-28 flex flex-row justify-center`}>
                  <Text style={tw`text-black`}>{ amount + currentInventoryAmount }</Text>
                </DataTable.Cell>
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
