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
    soldOperations: IProductInventory[], // Outflow in concept of selling
    repositionsOperations: IProductInventory[], // Outflow in concept of repositions
    returnedInventory:IProductInventory[], // There is only "one" final inventory operations
    inventoryWithdrawal:boolean,
    inventoryOutflow:boolean,
    finalOperation:boolean,
    issueInventory:boolean,
    isInventoryOperationModifiable:boolean
  }) => {
    console.log("total restocks: ", restockInventories.length)
    const headerTableStyle:string = 'w-28 flex flex-row justify-center';
    const viewTagHeaderTableStyle:string = 'w-full flex flex-row items-center justify-center';
    const textHeaderTableStyle:string = 'text-black text-center max-w-28 flex flex-row justify-center';

    const rowTableStyle:string = '';
    const cellTableStyle:string = 'w-28 flex flex-row justify-center';
    const viewTagRowTableStyle:string = 'w-full flex flex-row items-center justify-center';
    const textRowTableStyle:string = 'text-center ml-3 text-black max-w-28 flex flex-row justify-center';

  return (
    <View style={tw`w-full flex flex-row`}>
      { (initialInventory.length > 0
      || returnedInventory.length > 0
      || restockInventories.length > 0) ?
        <View style={tw`w-full flex flex-row`}>
          {/* Datatable for name of the products */}
          <DataTable style={tw`w-1/3`}>
            <DataTable.Header>
              <DataTable.Title style={tw`${headerTableStyle}`}>
                <View style={tw`${viewTagHeaderTableStyle}`}>
                  <Text style={tw`${textHeaderTableStyle}`}>
                    Producto
                  </Text>
                </View>
              </DataTable.Title>
            </DataTable.Header>
            { inventory.map((product) => {
              return (
                <DataTable.Row key={product.id_product} style={tw`${rowTableStyle}`}>
                  <DataTable.Cell style={tw`${cellTableStyle}`}>
                    <View style={tw`${viewTagRowTableStyle}`}>
                      <Text style={tw`${textRowTableStyle}`}>
                        {product.product_name}
                      </Text>
                    </View>
                  </DataTable.Cell>
                </DataTable.Row>
              );})
            }
          </DataTable>
          {/* Datatable for the information for each concept */}
          <ScrollView horizontal={true}>
            <DataTable style={tw`w-full`}>
              {/* Header section */}
              <DataTable.Header>
                {/* This field is never empty since it is necessary anytime */}
                { initialInventory.length > 0 &&
                  <DataTable.Title style={tw`${headerTableStyle}`}>
                    <View style={tw`${viewTagHeaderTableStyle}`}>
                      <Text style={tw`${textHeaderTableStyle}`}>
                        Inventario inicial
                      </Text>
                    </View>
                  </DataTable.Title>
                }
                { restockInventories.length > 0 &&
                  restockInventories.map((currentInventory, index) => {
                    return (
                      <DataTable.Title key={index} style={tw`${headerTableStyle}`}>
                        <View style={tw`${viewTagHeaderTableStyle}`}>
                          <Text style={tw`${textHeaderTableStyle}`}>
                            Re-stock
                          </Text>
                        </View>
                      </DataTable.Title>
                    );
                  })
                }
                {/*
                  This field is never empty since it is the reason of this component (inventory operation)
                */}
                { inventoryWithdrawal &&
                  <DataTable.Title style={tw`${headerTableStyle}`}>
                    <View style={tw`${viewTagHeaderTableStyle}`}>
                      <Text style={tw`${textHeaderTableStyle}`}>
                        Total producto llevado
                      </Text>
                    </View>
                  </DataTable.Title>
                }
                { soldOperations.length > 0 &&
                  <DataTable.Title style={tw`${headerTableStyle}`}>
                    <View style={tw`${viewTagHeaderTableStyle}`}>
                      <Text style={tw`${textHeaderTableStyle}`}>
                        Venta
                      </Text>
                    </View>
                  </DataTable.Title>
                }
                { repositionsOperations.length > 0 &&
                  <DataTable.Title style={tw`${headerTableStyle}`}>
                    <View style={tw`${viewTagHeaderTableStyle}`}>
                      <Text style={tw`${textHeaderTableStyle}`}>
                        Reposición
                      </Text>
                    </View>
                  </DataTable.Title>
                }
                { inventoryOutflow &&
                  <DataTable.Title style={tw`${headerTableStyle}`}>
                    <View style={tw`${viewTagHeaderTableStyle}`}>
                      <Text style={tw`${textHeaderTableStyle}`}>
                        Total salidas de inventario
                      </Text>
                    </View>
                  </DataTable.Title>
                }
                { finalOperation &&
                  <DataTable.Title style={tw`${headerTableStyle}`}>
                    <View style={tw`${viewTagHeaderTableStyle}`}>
                      <Text style={tw`${textHeaderTableStyle}`}>
                        Inventario final
                      </Text>
                    </View>
                  </DataTable.Title>
                }
                { returnedInventory.length > 0 &&
                    <DataTable.Title style={tw`${headerTableStyle}`}>
                      <View style={tw`${viewTagHeaderTableStyle}`}>
                        <Text style={tw`${textHeaderTableStyle}`}>
                          Inventario regresado
                        </Text>
                      </View>
                  </DataTable.Title>
                }
                { issueInventory &&
                  <DataTable.Title style={tw`${headerTableStyle}`}>
                    <View style={tw`${viewTagHeaderTableStyle}`}>
                      <Text style={tw`${textHeaderTableStyle}`}>
                        Problema con inventario
                      </Text>
                    </View>
                  </DataTable.Title>
                }
              </DataTable.Header>
              {/* Body section */}
              { (initialInventory.length > 0 || returnedInventory.length > 0 || restockInventories.length > 0) &&
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
                    <DataTable.Row style={tw`${rowTableStyle}`}
                    key={product.id_product}>
                      {/* This field is never empty since it is necessary anytime */}
                      {/* Product (product identification) */}
                      {/* Suggested inventory */}
                      { suggestedInventory.length > 0 &&
                        <DataTable.Cell style={tw`${cellTableStyle}`}>
                          <View style={tw`${viewTagRowTableStyle}`}>
                            <Text style={tw`${textRowTableStyle}`}>
                              {suggestedAmount}
                            </Text>
                          </View>
                        </DataTable.Cell>
                      }
                      {/* Initial inventory */}
                      { initialInventory.length > 0 &&
                        <DataTable.Cell style={tw`${cellTableStyle}`}>
                          <View style={tw`${viewTagRowTableStyle}`}>
                            <Text style={tw`${textRowTableStyle}`}>
                              {initialInventoryOperationAmount}
                            </Text>
                          </View>
                      </DataTable.Cell>

                      }
                      {/* Restock of product */}
                      { restockInventoryOperationAmount.length > 0 &&
                        restockInventoryOperationAmount.map((productAmount, index) => {
                          return (
                            <DataTable.Cell key={index} style={tw`${cellTableStyle}`}>
                              <View style={tw`${viewTagRowTableStyle}`}>
                                <Text style={tw`${textRowTableStyle}`}>
                                  {productAmount}
                                </Text>
                              </View>
                            </DataTable.Cell>
                          );
                        })
                      }
                      {/* Inflow product */}
                      { inventoryWithdrawal === true &&
                        <DataTable.Cell style={tw`${cellTableStyle}`}>
                          <View style={tw`${viewTagRowTableStyle}`}>
                            <Text style={tw`${textRowTableStyle}`}>
                              {withdrawalAmount}
                            </Text>
                          </View>
                        </DataTable.Cell>
                      }
                      {/* Product sold */}
                      { soldOperations.length > 0 &&
                        <DataTable.Cell style={tw`${cellTableStyle}`}>
                          <View style={tw`${viewTagRowTableStyle}`}>
                            <Text style={tw`${textRowTableStyle}`}>
                              {soldInventoryOperationAmount}
                            </Text>
                          </View>
                        </DataTable.Cell>
                      }
                      {/* Product reposition */}
                      { repositionsOperations.length > 0 &&
                        <DataTable.Cell style={tw`${cellTableStyle}`}>
                          <View style={tw`${viewTagRowTableStyle}`}>
                            <Text style={tw`${textRowTableStyle}`}>
                              {repositionInventoryOperationAmount}
                            </Text>
                          </View>
                        </DataTable.Cell>
                      }
                      {/* Outflow product */}
                      { inventoryOutflow === true &&
                        <DataTable.Cell style={tw`${cellTableStyle}`}>
                          <View style={tw`${viewTagRowTableStyle}`}>
                            <Text style={tw`${textRowTableStyle}`}>
                              {inventoryOutflowAmount}
                            </Text>
                          </View>
                        </DataTable.Cell>
                      }
                      {/* Final inventory */}
                      { finalOperation === true &&
                        <DataTable.Cell style={tw`${cellTableStyle}`}>
                          <View style={tw`${viewTagRowTableStyle}`}>
                            <Text style={tw`${textRowTableStyle}`}>
                              {finalOperationAmount}
                            </Text>
                          </View>
                        </DataTable.Cell>
                      }
                      {/* Returned inventory */}
                      { returnedInventory.length > 0 &&
                        <DataTable.Cell style={tw`${cellTableStyle}`}>
                          <View style={tw`${viewTagRowTableStyle}`}>
                            <Text style={tw`${textRowTableStyle}`}>
                              {returnedInventoryOperationAmount}
                            </Text>
                          </View>
                        </DataTable.Cell>
                      }
                      {/* Inventory problem */}
                      { issueInventory === true &&
                        <DataTable.Cell style={tw`${cellTableStyle} 
                          ${inventoryIssueAmount === 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                          <View style={tw`${viewTagRowTableStyle}`}>
                            <Text style={tw`${textRowTableStyle}`}>
                              {inventoryIssueAmount}
                            </Text>
                          </View>
                        </DataTable.Cell>
                      }
                    </DataTable.Row>
                  );
                })
              }
            </DataTable>
          </ScrollView>
        </View> :
        <View style={tw`w-full flex flex-col justify-center`}>
          <ActivityIndicator size={'large'} />
        </View>
      }
    </View>
  );
};

export default TableInventoryVisualization;
