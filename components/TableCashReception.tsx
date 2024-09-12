import React from 'react';
import { TextInput, Text } from 'react-native';
import { ICurrency } from '../interfaces/interfaces';
import { DataTable } from 'react-native-paper';
import tw from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';

const TableCashReception = (
  {cashInventoryOperation, setCashInventoryOperation}:
  {cashInventoryOperation:ICurrency[], setCashInventoryOperation:any}) => {

  // Inventory
  const handleChangeAmountCash = (id_denomination:number, input: string) => {
    const index:number|undefined = cashInventoryOperation.findIndex(
    (product:ICurrency) => product.id_denomination === id_denomination);

    const updatedCashInventory: ICurrency[] = [...cashInventoryOperation];

    if (index !== undefined || index !== -1) {
      const updatedCash = { ...updatedCashInventory[index] };

      if (input === '') {
        updatedCash.amount = 0;
      } else {
        updatedCash.amount = parseInt(input, 32) || 0;
      }
      updatedCashInventory[index] = updatedCash;

      setCashInventoryOperation(updatedCashInventory);
    }
  };


  return (
    <DataTable style={tw`w-full`}>
      <DataTable.Header>
        <DataTable.Title style={tw`flex flex-row justify-center text-center`}>
          <Text style={tw`text-black`}>Denominación</Text>
        </DataTable.Title>
        <DataTable.Title style={tw`flex flex-row justify-center text-center`}>
          <Text style={tw`text-black`}>Cantidad</Text>
        </DataTable.Title>
      </DataTable.Header>
      {cashInventoryOperation.map((denomination:ICurrency) => (
        <DataTable.Row
        key={denomination.id_denomination}>
          <DataTable.Cell style={tw`flex flex-row justify-center`}>
            <Text style={tw`text-black`}>${denomination.value}</Text>
          </DataTable.Cell>
          <DataTable.Cell style={tw`flex flex-row justify-center`}>
            <TextInput
              style={tw`h-10 w-full 
                border border-black rounded-lg px-4 bg-slate-100 
                text-xs text-black text-center`}
              onChangeText={(input:string) =>
                handleChangeAmountCash(denomination.id_denomination, input)}
              placeholder={'Cantidad'}
              keyboardType={'numeric'}
              />
          </DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable>
  );
};

export default TableCashReception;
