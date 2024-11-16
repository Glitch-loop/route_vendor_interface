// Libraries
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DataTable, ActivityIndicator } from 'react-native-paper';
import tw from 'twrnc';

// Interfaces
import {
  IProductInventory,
  
  ITransactionDescriptions,
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

const TableInventoryVisualization = (
  {
    inventory,
    suggestedInventory,
    initialInventory,
    restockInventories,
    soldOperations,
    repositionsOperations,
    returnedInventory,
    inventoryWithdrawal = false,
    inventoryOutflow = false,
    finalOperation = false,
    issueInventory = false,
  }:{
    inventory:IProductInventory[],
    suggestedInventory: IProductInventory[],
    initialInventory:IProductInventory[], // There is only "one" initial inventory operation
    restockInventories:IProductInventory[][], // It could be many "restock" inventories
    soldOperations: ITransactionDescriptions[], // Outflow in concept of selling
    repositionsOperations: ITransactionDescriptions[], // Outflow in concept of repositions
    returnedInventory:IProductInventory[], // There is only "one" final inventory operations
    inventoryWithdrawal:boolean,
    inventoryOutflow:boolean,
    finalOperation:boolean,
    issueInventory:boolean,
  }) => {
  return (
    <View style={tw`w-full flex flex-row`}>
      <DataTable style={tw`w-1/3`}>
      <DataTable.Header>
        <DataTable.Title style={tw`w-32 flex flex-row justify-center text-center`}>
          <Text style={tw`text-black`}>Producto</Text>
        </DataTable.Title>
      </DataTable.Header>
      { inventory.map((product) => {
        return (
          <DataTable.Row key={product.id_product}>
            <DataTable.Cell style={tw`w-32  flex flex-row justify-center`}>
                <Text style={tw`text-black`}>{product.product_name}</Text>
              </DataTable.Cell>
          </DataTable.Row>
        );})
      }
      </DataTable>
      <ScrollView horizontal={true}>
        <DataTable style={tw`w-full`}>
          {/* Header section */}
          <DataTable.Header>
            {/* This field is never empty since it is necessary anytime */}
            {/* <DataTable.Title style={tw`w-32 flex flex-row justify-center text-center`}>
              <Text style={tw`text-black`}>Producto</Text>
            </DataTable.Title> */}
            { initialInventory.length > 0 &&
              <DataTable.Title style={tw`w-28 flex flex-row justify-center text-center`}>
                <Text style={tw`text-black`}>Inventario inicial</Text>
              </DataTable.Title>
            }
            { restockInventories.length > 0 &&
              restockInventories.map((currentInventory, index) => {
                return (
                <DataTable.Title
                  key={index}
                  style={tw`w-24 flex flex-row justify-center text-center`}>
                  <Text style={tw`text-black`}>Re-stock</Text>
                </DataTable.Title>
                );
              })
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
          { (initialInventory.length > 0 || returnedInventory.length > 0 || restockInventories.length > 0) ?
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
              let suggestedAmount = 0;
              let initialInventoryOperationAmount = 0;
              let returnedInventoryOperationAmount = 0;
              let restockInventoryOperationAmount:number[] = [];
              let soldInventoryOperationAmount = 0;
              let repositionInventoryOperationAmount = 0;

              // Special calculations variables
              let withdrawalAmount = 0;
              let inventoryOutflowAmount = 0;
              let finalOperationAmount = 0;
              let inventoryIssueAmount = 0;

              // Searching the product in the inventory operations
              suggestedAmount                   = findProductAmountInArray(suggestedInventory, id_product);
              initialInventoryOperationAmount   = findProductAmountInArray(initialInventory, id_product);
              returnedInventoryOperationAmount  = findProductAmountInArray(returnedInventory, id_product);
              soldInventoryOperationAmount  = findProductAmountInArray(soldOperations, id_product);
              repositionInventoryOperationAmount
                = findProductAmountInArray(repositionsOperations, id_product);

              restockInventories.forEach((restockInventory:IProductInventory[]) => {
                const currentRestockProductAmount
                  = findProductAmountInArray(restockInventory, id_product);

                  withdrawalAmount += currentRestockProductAmount;
                restockInventoryOperationAmount.push(currentRestockProductAmount);
              });

              // Special calculations
              withdrawalAmount += initialInventoryOperationAmount;
              inventoryOutflowAmount = soldInventoryOperationAmount + repositionInventoryOperationAmount;

              finalOperationAmount = withdrawalAmount - inventoryOutflowAmount;

              inventoryIssueAmount = finalOperationAmount - returnedInventoryOperationAmount;
              return (
                <DataTable.Row key={product.id_product}>
                  {/* This field is never empty since it is necessary anytime */}
                  {/* Product (product identification) */}
                  {/* <DataTable.Cell style={tw`w-32  flex flex-row justify-center`}>
                    <Text style={tw`text-black`}>{product.product_name}</Text>
                  </DataTable.Cell> */}
                  {/* Suggested inventory */}
                  { suggestedInventory.length > 0 &&
                    <DataTable.Cell style={tw`w-20 flex flex-row justify-center`}>
                      <Text style={tw`text-black`}>{suggestedAmount}</Text>
                    </DataTable.Cell>
                  }
                  {/* Initial inventory */}
                  { initialInventory.length > 0 &&
                    <DataTable.Cell style={tw`w-24 flex flex-row justify-center`}>
                      <Text style={tw`text-black`}>{initialInventoryOperationAmount}</Text>
                    </DataTable.Cell>
                  }
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
                  { inventoryWithdrawal === true &&
                    <DataTable.Cell style={tw`w-24 flex flex-row justify-center`}>
                      <Text style={tw`text-black`}>{withdrawalAmount}</Text>
                    </DataTable.Cell>
                  }
                  {/* Product sold */}
                  { soldOperations.length > 0 &&
                    <DataTable.Cell style={tw`w-24 flex flex-row justify-center`}>
                      <Text style={tw`text-black`}>{soldInventoryOperationAmount}</Text>
                    </DataTable.Cell>
                  }
                  {/* Product reposition */}
                  { repositionsOperations.length > 0 &&
                    <DataTable.Cell style={tw`w-24 flex flex-row justify-center`}>
                      <Text style={tw`text-black`}>{repositionInventoryOperationAmount}</Text>
                    </DataTable.Cell>
                  }
                  {/* Outflow product */}
                  { inventoryOutflow === true &&
                    <DataTable.Cell style={tw`w-24 flex flex-row justify-center`}>
                      <Text style={tw`text-black`}>{inventoryOutflowAmount}</Text>
                    </DataTable.Cell>
                  }
                  {/* Final inventory */}
                  { finalOperation === true &&
                    <DataTable.Cell style={tw`w-24 flex flex-row justify-center`}>
                      <Text style={tw`text-black`}>{finalOperationAmount}</Text>
                    </DataTable.Cell>
                  }
                  {/* Returned inventory */}
                  { returnedInventory.length > 0 &&
                    <DataTable.Cell style={tw`w-24 flex flex-row justify-center`}>
                      <Text style={tw`text-black`}>{returnedInventoryOperationAmount}</Text>
                    </DataTable.Cell>
                  }
                  {/* Inventory problem */}
                  { issueInventory === true &&
                    <DataTable.Cell style={tw`w-24 flex flex-row justify-center ${
                      inventoryIssueAmount === 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                      <Text style={tw`text-black`}>{inventoryIssueAmount}</Text>
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
      </ScrollView>
    </View>
  );
};

export default TableInventoryVisualization;
