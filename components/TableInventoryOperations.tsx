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

const TableInventoryOperations = (
  {
    suggestedInventory,
    currentInventory,
    operationInventory,
    setInventoryOperation,
  }:{
    suggestedInventory:IProductInventory[],
    currentInventory:IProductInventory[],
    operationInventory:IProductInventory[],
    setInventoryOperation:any,
  }) => {

  // const [inputValue, setInputValue] = useState(amount.toString());
  /*
    This handler updates the amount that the vendor took to carry to the route.
  */
  // Handlers
  const handleChangeInventory = (id_product:string, input: string) => {
    // Parsing input
    let parsedInput:number = parseInt(input, 10);

    // Creating a copy og the inventory operation.
    const updatedInventory: IProductInventory[] = [...operationInventory];

    // Looking for the product to update.
    const index:number = operationInventory
      .findIndex((product:IProductInventory) => product.id_product === id_product);


    if (index !== -1) { // The product exists in the inventory.
      const updatedProduct = { ...updatedInventory[index] };

      if (isNaN(parsedInput)) { // The input to convert was invalid.
        updatedProduct.amount = 0;
      } else {
        if (parsedInput >= 0) { // Valid input
          updatedProduct.amount = parsedInput;
        } else { // Invalid input
          updatedProduct.amount = 0;
        }
      }

      updatedInventory[index] = updatedProduct;

      setInventoryOperation(updatedInventory);
    } else {
      /* The product is not in the inventory */
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
          <DataTable.Title style={tw`w-28 flex flex-row justify-center text-center`}>
            <Text style={tw`text-black`}>Inventario a llevar</Text>
          </DataTable.Title>
      </DataTable.Header>
      {/* Body section */}
      {/*
        It was decided that all the table will depend on "operationInventory".
        This array will contain all the products so it is just matter of searching in the other
        array to get the "current product" in the actual iteration, if it was not found, that means
        that product in that particular operation have any implication.

        Due this component architecture is that it is considered as very expensive, this becuase of
        we need to traverse the main array while we have to search if there is match in the other arrays.

        A good new is that it is expected that in "production" the amount of products don't pass of houndred of
        products (it implies many rows), at the same time the restocks (columns) it is expected that at maximum,
        a vendor makes five restocks in a day.
        In addition, the consult of inventories is expected that it won't be so common.
      */}
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
