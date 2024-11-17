// Libraries
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DataTable, ActivityIndicator } from 'react-native-paper';
import tw from 'twrnc';

// Interfaces
import {
  IProductInventory,
 } from '../../interfaces/interfaces';
import { findProductAmountInArray } from '../../utils/inventoryOperations';

/*
  To generalize as much as possible, this component was made to be capable of showing all the possible "inventory operations".

  At the moment of write this,  there are 4 possible operations:
  - Start inventory
  - Restock inventory
  - Product inventory
  - Final inventory

  Although each one impacts to the inventory in some way, all of them shares the same interface,
  so it was decided that the component will work as follows.

  The component recieves the following parameters:
    - suggestedInventory
    - currentInventory
    - operationInventory
    - enablingFinalInventory
    - setInventoryOperation

  With the combination of all of them is that we can make all the possible inventory operations.

  It is important to know that the pivotal prop is "operationInventory" that is the "state" that will
  store the input of the user, in this way "suggestedInventory", "currentInventoy" and
  "enablingFinalInventory" are auxiliar props that complements the information for the user.

  Another thing to take account is that to indicate that some prop is not needed (at least for
  "suggestedInventory" and "currentInventoy") for the inventory operations, the prop has to recieve
  an empty array, so in this way the component will know that that information is not needed.

  For example if I want to make an "start inventory", I'm going to pass a prop the state on which I will
  store the input of the user (in addition of its handler to manage the events) and in the other props
  I will pass an empty array "[]" and in the case of enablingFinalInventory I will pass "false".

  In the case of a "restock operation" on which I need all auxiliar oepration I will pass the array
  with the information according to the prop.

  Important note: Since productIventory is taken as the main array to display the table the other array
  may not be completed with all the products and it will work without problems.
*/

const TableInventoryOperationsVisualization = (
  {
    inventory,
    titleColumns,
    productInventories,
    calculateTotal = false,
  }:{
    inventory:IProductInventory[],
    titleColumns: string[],
    productInventories:IProductInventory[][],
    calculateTotal:boolean
  }) => {

  return (
    <View style={tw`w-full flex flex-row`}>
      {(productInventories.length > 0) ?
        <View style={tw`w-full flex flex-row`}>
          {/* Datatable for name of the products */}
          <DataTable style={tw`w-1/3`}>
            <DataTable.Header>
              {/* This field is never empty since it is necessary anytime */}
              <DataTable.Title style={tw`w-32 flex flex-row justify-center text-center`}>
                  <Text style={tw`text-black`}>Producto</Text>
                </DataTable.Title>
            </DataTable.Header>
            {(productInventories.length > 0) &&
                inventory.map((product) => {
                  return (
                    <DataTable.Row key={product.id_product}>
                      {/* This field is never empty since it is necessary anytime */}
                      {/* Product (product identification) */}
                      <DataTable.Cell style={tw`w-32 flex flex-row justify-center`}>
                        <Text style={tw`text-black text-center`}>{product.product_name}</Text>
                      </DataTable.Cell>
                    </DataTable.Row>
                  );
                })
            }
          </DataTable>
          {/* Datatable for the information for each concept */}
          <ScrollView horizontal={true}>
            <DataTable style={tw`w-full`}>
              {/* Header section */}
              <DataTable.Header>
                {/* This field is never empty since it is necessary anytime */}
                {/* <DataTable.Title style={tw`w-32 flex flex-row justify-center text-center`}>
                  <Text style={tw`text-black`}>Producto</Text>
                </DataTable.Title> */}
                { titleColumns.map((titleColumn, index) => {
                  return <DataTable.Title key={index}
                    style={tw`w-28 flex flex-row justify-center text-center`}>
                    <Text style={tw`text-black`}>{titleColumn}</Text>
                  </DataTable.Title>;})
                }
                { calculateTotal &&
                  <DataTable.Title style={tw`w-32 flex flex-row justify-center text-center`}>
                    <Text style={tw`text-black`}>Total</Text>
                  </DataTable.Title>
                }
              </DataTable.Header>
              {/* Body section */}
              { (productInventories.length > 0) &&
                inventory.map((product) => {
                  /*
                    To keep an order of how to print the inventory operations, it is used the variable "inventory" which has
                    all the products (and the current amount for each product).

                    "Inventory" is used has the reference of what to print in the "current iteration", so it is going to depend
                    on the current product that it is going to be searched that particular product in the other arrays that store
                    the information of the "product inventory"

                    Since the inventory operations only store if a product had a movement, if there is not find the product of the
                    current operation, it is going to be diplayed with a value of "0" (indicating that it was not a
                    movement of that particular product).
                  */

                  // Propierties that are always going to be present.
                  let id_product = product.id_product;
                  let amount = product.amount;

                  /* Declaring variables that will store the amount of product for each type of operation*/
                  let restockInventoryOperationAmount:number[] = [];

                  // Special calculations variables
                  let totalOfTable = 0;

                  // Searching the product in the inventory operations
                  productInventories.forEach((restockInventory:IProductInventory[]) => {
                    const currentProductInventoryAmount
                      = findProductAmountInArray(restockInventory, id_product);

                    totalOfTable += currentProductInventoryAmount;
                    restockInventoryOperationAmount.push(currentProductInventoryAmount);
                  });

                  return (
                    <DataTable.Row key={product.id_product}>
                      {/* This field is never empty since it is necessary anytime */}
                      {/* Product (product identification) */}
                      {/* <DataTable.Cell style={tw`w-32  flex flex-row justify-center`}>
                        <Text style={tw`text-black`}>{product.product_name}</Text>
                      </DataTable.Cell> */}
                      {/* Restock of product */}
                      { restockInventoryOperationAmount.length > 0 &&
                        restockInventoryOperationAmount.map((productAmount, index) => {
                          return (
                          <DataTable.Cell
                            key={index}
                            style={tw`w-24 flex flex-row justify-center`}>
                            <Text style={tw`text-black`}>{productAmount}</Text>
                          </DataTable.Cell>
                          );
                        })
                      }
                      {/* Inflow product */}
                      { calculateTotal === true &&
                        <DataTable.Cell style={tw`w-24 flex flex-row justify-center`}>
                          <Text style={tw`text-black`}>{totalOfTable}</Text>
                        </DataTable.Cell>
                      }
                    </DataTable.Row>
                  );
                })
              }
            </DataTable>
          </ScrollView>
        </View> :
        <View style={tw`w-full my-3 flex flex-col justify-center`}>
          <ActivityIndicator size={'large'} />
        </View>
    }
    </View>
  );
};

export default TableInventoryOperationsVisualization;
