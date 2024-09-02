import { useEffect, useState } from 'react';
import { View, ScrollView, TextInput } from 'react-native';
import { getAllProducts } from '../endpoints/endpoint';
import { IProduct } from '../interfaces/interfaces';
import { DataTable } from 'react-native-paper';
import tw from 'twrnc';

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
    <View>
      <ScrollView>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title
              style={tw`text-center flex flex-row justify-center`}>
                Producto
            </DataTable.Title>
            {/* <DataTable.Title numeric>
              Inventario sugerido
            </DataTable.Title> */}
            <DataTable.Title
              style={tw`text-center flex flex-row justify-center`}>
              Inicio de ruta
            </DataTable.Title>
          </DataTable.Header>

          {inventory.map((product) => (
            <DataTable.Row key={product.id_product}>
              <DataTable.Cell
                style={tw`text-center flex flex-row justify-center`}>
                {product.product_name}
              </DataTable.Cell>
              <DataTable.Cell
                style={tw`text-center flex flex-row justify-center`}>
                {/* <TextInput
                  value={number}
                  placeholder="useless placeholder"
                  keyboardType="numeric"
                  /> */}
                {product.price}
              </DataTable.Cell>
            </DataTable.Row>
          ))}

          {/* <DataTable.Pagination
            page={page}
            numberOfPages={Math.ceil(items.length / itemsPerPage)}
            onPageChange={(page) => setPage(page)}
            label={`${from + 1}-${to} of ${items.length}`}
            numberOfItemsPerPageList={numberOfItemsPerPageList}
            numberOfItemsPerPage={itemsPerPage}
            onItemsPerPageChange={onItemsPerPageChange}
            showFastPaginationControls
            selectPageDropdownLabel={'Rows per page'}
          /> */}
        </DataTable>
      </ScrollView>
    </View>
  );
};

export default TableInventoryOperations;
