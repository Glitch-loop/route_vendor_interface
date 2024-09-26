import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import { createSQLiteConnection } from '../../lib/SQLite';

const SqlLiteQueries = () => {
  useEffect(() => {

    // Create the table when the component mounts
    createTable();
  }, []);

  // Function to create a table
  const createTable = async () => {
    try {
    // Open or create the database
    const sqlite = await createSQLiteConnection();
      await sqlite.transaction( async (tx) => {
        const result = await tx.executeSql(
          `CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price REAL
          );`
        );
      });
    } catch (error) {
      console.error('Failed to create table:', error);
    }
  };

  // Function to insert a product
  const insertProduct = async (name: string, price: number) => {
    try {
      const sqlite = await createSQLiteConnection();
      await sqlite.transaction(async (tx) => {
        await tx.executeSql(
          'INSERT INTO products (name, price) VALUES (?, ?)',
          [name, price]
        );
        console.log('Product inserted successfully');
      });

    } catch (error) {
      console.error('Failed to insert product:', error);
    }
  };

  // Function to fetch all products
  const fetchProducts = async () => {
    try {
      const sqlite = await createSQLiteConnection();
      const result = await sqlite.executeSql('SELECT * FROM products');

      result.forEach((result) => {
        for (let index = 0; index < result.rows.length; index++) {
          console.log(result.rows.item(index))
        }
      })
    //   await sqlite.transaction(async (tx) => {
    //     const results = tx.executeSql('SELECT * FROM products')
    //     .then((response) => {
    //       const rows = response[0].rows;
    //       let products = [];
    //       for (let i = 0; i < rows.length; i++) {
    //         products.push(rows.item(i));
    //       }
    //     })
    //     .catch((error) => {
    //       console.log(error);
    //     });
    //   });
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Insert Product" onPress={() => insertProduct('Apple', 1.99)} />
      <Button title="Fetch Products" onPress={fetchProducts} />
    </View>
  );
};

export default SqlLiteQueries;
