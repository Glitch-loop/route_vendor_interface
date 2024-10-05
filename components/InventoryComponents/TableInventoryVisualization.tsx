// Libraries
import React from 'react';
import { TextInput, Text, View } from 'react-native';
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
    restockOperations,
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
    initialInventory:IProductInventory[],
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
        { initialInventory.length > 0 &&
          <DataTable.Title style={tw`w-20 flex flex-row justify-center text-center`}>
            <Text style={tw`text-black`}>Inventario inicial</Text>
          </DataTable.Title>
        }
        { restockOperations.length > 0 &&
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
      { (initialInventory.length > 0 || returnedInventory.length > 0 || restockOperations.length > 0) ?
        inventory.map((product) => {
          /*
            To understand how this component works, since inventory already have all the products that the vendor is currently
            carrying to sell in the route, we can use this array to have a pivot that determines which product print.

            Remember that the inventory operations only store the "movements" (inflow of products in the vendor's inventory)
            that are in that operation for avoiding store unnecessary information; store all the current inventory with "0"
            inflow of a particualr product.

            To keep thing easy, what this function does is to traverse the inventory array (which has all the possible products)
            and in each iteration, the product corresponds to this iteration is found between the arrays of the inventory product 
            operations (that are props in this component).
          */

          // Propierties that are always going to be present.
          let id_product = product.id_product;
          let amount = product.amount;

          /* Declaring variables that will store amount of product for each type of operation*/
          let suggestedAmount = 0;
          let initialInventoryOperationAmount = 0;
          let returnedInventoryOperationAmount = 0;

          suggestedAmount                 = findProductAmountInArray(suggestedInventory, id_product);
          initialInventoryOperationAmount = findProductAmountInArray(initialInventory, id_product);
          returnedInventoryOperationAmount = findProductAmountInArray(returnedInventory, id_product);

          /*
            Pending to do:
            restockOperations
          */


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
              { initialInventory.length > 0 &&
                <DataTable.Cell style={tw`w-24 flex flex-row justify-center`}>
                  <Text style={tw`text-black`}>{initialInventoryOperationAmount}</Text>
                </DataTable.Cell>
              }
              { returnedInventory.length > 0 &&
                <DataTable.Cell style={tw`w-24 flex flex-row justify-center`}>
                  <Text style={tw`text-black`}>{returnedInventoryOperationAmount}</Text>
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

export default TableInventoryVisualization;
