// Libraries
import React from 'react';
import { TextInput, Text, View } from 'react-native';
import { DataTable, ActivityIndicator } from 'react-native-paper';
import tw from 'twrnc';

// Interfaces
import { IProductInventory } from '../interfaces/interfaces';

/*
  An attempt was made to generelize as much as possible.
  At the moment of write this documentation there are 4 possible operations:
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


const TableInventoryOperations = (
  {
    suggestedInventory,
    currentInventory,
    operationInventory,
    enablingFinalInventory = false,
    setInventoryOperation,
  }:{
    suggestedInventory:IProductInventory[],
    currentInventory:IProductInventory[],
    operationInventory:IProductInventory[],
    enablingFinalInventory:boolean,
    setInventoryOperation:any,
  }) => {

  // Inventory
  const handleChangeInventory = (id_product:string, input: string) => {
    const index:number|undefined = operationInventory.findIndex(
    (product:IProductInventory) => product.id_product === id_product);

    const updatedInventory: IProductInventory[] = [...operationInventory];

    if (index !== undefined || index !== -1) {
      const updatedProduct = { ...updatedInventory[index] };

      if (input === '') {
        updatedProduct.amount = 0;
      } else {
        updatedProduct.amount = parseInt(input, 10) || 0;
      }

      updatedInventory[index] = updatedProduct;

      setInventoryOperation(updatedInventory);
    }
  };



  return (
    <DataTable style={tw`w-full`}>
      {/* Header section */}
      <DataTable.Header>
        {/* This field is never empty since it is necessary anytime */}
        <DataTable.Title style={tw`w-32 flex flex-row justify-center text-center`}>
          <Text style={tw`text-black`}>Producto</Text>
        </DataTable.Title>
        { suggestedInventory.length > 0 &&
          <DataTable.Title style={tw`w-20 flex flex-row justify-center text-center`}>
            <Text style={tw`text-black`}>Sugerido</Text>
          </DataTable.Title>
        }
        { currentInventory.length > 0 &&
          <DataTable.Title style={tw`w-24 flex flex-row justify-center text-center`}>
            <Text style={tw`text-black`}>Inventario Actual</Text>
          </DataTable.Title>
        }
        {/*
          This field is never empty since it is the reason of this component (inventory operation)
        */}
        <DataTable.Title style={tw`w-28 flex flex-row justify-center text-center`}>
          <Text style={tw`text-black`}>Producto recibido</Text>
        </DataTable.Title>
        { enablingFinalInventory &&
          <DataTable.Title style={tw`w-28 flex flex-row justify-center text-center`}>
            <Text style={tw`text-black`}>Inventario final</Text>
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
                  onChangeText={(input:string) => handleChangeInventory(id_product, input)}
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
