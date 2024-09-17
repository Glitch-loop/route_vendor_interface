import React from 'react';
import { TextInput, Text, View } from 'react-native';
import { IProductInventory } from '../interfaces/interfaces';
import { DataTable, ActivityIndicator } from 'react-native-paper';
import tw from 'twrnc';

const TableInventoryOperations = (
  {inventoryOperation, setInventoryOperation}:
  {inventoryOperation:IProductInventory[], setInventoryOperation:any}) => {

  // Inventory
  const handleChangeInventory = (id_product:string, input: string) => {
    const index:number|undefined = inventoryOperation.findIndex(
    (product:IProductInventory) => product.id_product === id_product);

    const updatedInventory: IProductInventory[] = [...inventoryOperation];

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
      <DataTable.Header>
        <DataTable.Title style={tw`flex flex-row justify-center text-center`}>
          <Text style={tw`text-black`}>Producto</Text>
        </DataTable.Title>
        <DataTable.Title style={tw`flex flex-row justify-center text-center`}>
          <Text style={tw`text-black`}>Inventario real</Text>
        </DataTable.Title>
      </DataTable.Header>
      { inventoryOperation.length > 0 ?
        inventoryOperation.map((product) => (
          <DataTable.Row
          key={product.id_product}>
            <DataTable.Cell style={tw`flex flex-row justify-center`}>
              <Text style={tw`text-black`}>{product.product_name}</Text>
            </DataTable.Cell>
            <DataTable.Cell style={tw`flex flex-row justify-center`}>
              <TextInput
                style={tw`h-10 w-full 
                  border border-black rounded-lg px-4 bg-slate-100 
                  text-xs text-black text-center`}
                onChangeText={(amount:string) => handleChangeInventory(product.id_product, amount)}
                placeholder={'Cantidad'}
                keyboardType={'numeric'}
                />
            </DataTable.Cell>
          </DataTable.Row>
        )) :
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
