import { useEffect, useState } from 'react';
import { TextInput, Text } from 'react-native';
import { getAllProducts } from '../endpoints/endpoint';
import { IProduct } from '../interfaces/interfaces';
import { DataTable } from 'react-native-paper';
import tw from 'twrnc';
import React from 'react';

interface IProductInventory extends IProduct {
  amount: number
}

const TableInventoryOperations = () => {
  const [inventory, setInventory] = useState<IProductInventory[]>([]);

  useEffect(() => {
    getAllProducts().then(products => {
      let initializeInventory: IProductInventory[] = [];
      products.forEach(product => {
        initializeInventory.push({...product, amount: 0});
      });
      setInventory(initializeInventory);
    });
  }, []);

  return (
    <DataTable style={tw`w-full`}>
      <DataTable.Header>
        <DataTable.Title style={tw`text-wrap flex flex-row justify-center text-center`}>
          <Text style={tw`text-black`}>Producto</Text>
        </DataTable.Title>
        <DataTable.Title style={tw`text-wrap flex flex-row justify-center text-center`}>
          <Text style={tw`text-black`}>Sugerido</Text>
        </DataTable.Title>
        <DataTable.Title style={tw`text-wrap flex flex-row justify-center text-center`}>
          <Text style={tw`text-black`}>Inventario real</Text>
        </DataTable.Title>
        <DataTable.Title style={tw`text-wrap flex flex-row justify-center text-center`}>
          <Text >Otro</Text>
        </DataTable.Title>
      </DataTable.Header>
      {inventory.map((product) => (
        <DataTable.Row
        key={product.id_product}>
          <DataTable.Cell style={tw`text-wrap flex flex-row justify-center`}>
            <Text style={tw`text-black`}>{product.product_name}</Text>
          </DataTable.Cell>
          <DataTable.Cell style={tw`text-wrap flex flex-row justify-center`}>
            <Text style={tw`text-black`}> {product.price} </Text>
          </DataTable.Cell>
          <DataTable.Cell style={tw`text-wrap flex flex-row justify-center`}>
            <TextInput
              style={tw`h-10 w-full 
                border border-black rounded-lg px-4 bg-slate-100 
                text-xs text-black text-center`}
              // value={product.amount.toString()}
              placeholder={'Cantidad'}
              keyboardType={'numeric'}
              />
          </DataTable.Cell>
          <DataTable.Cell style={tw`text-wrap flex flex-row justify-center`}>
              <Text> {product.price} </Text>
          </DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable>
  );
};

export default TableInventoryOperations;
