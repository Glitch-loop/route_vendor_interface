import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

function errorCB(err) {
  console.log("SQL Error: " + err);
}

function successCB() {
  console.log("SQL executed fine");
}

function openCB() {
  console.log("Database OPENED");
}


// Enable SQLite debugging
SQLite.enablePromise(true);



const SqlLiteQueries = () => {
  useEffect(() => {

    // Create the table when the component mounts
    createTable();
  }, []);

  // Function to create a table
  const createTable = async () => {
    try {
    // Open or create the database

    const db = await SQLite.openDatabase({ name: 'mydb.db', location: 'default' },openCB, errorCB);
    for (let x in db){
      console.log(x)
    }
    console.log(db)
      await db.transaction( async (tx) => {
        await tx.executeSql(
          `CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price REAL
          );`
        );
        console.log('Table created successfully');
      });
    } catch (error) {
      console.error('Failed to create table:', error);
    }
  };

  // Function to insert a product
  const insertProduct = async (name: string, price: number) => {
    try {
      const db = await SQLite.openDatabase({ name: 'mydb.db', location: 'default' },openCB, errorCB);
      await db.transaction(async (tx) => {
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
      const db = await SQLite.openDatabase({ name: 'mydb.db', location: 'default' },openCB, errorCB);
      await db.transaction(async (tx) => {
        const results = await tx.executeSql('SELECT * FROM products');
        const rows = results[0].rows;
        let products = [];
        for (let i = 0; i < rows.length; i++) {
          products.push(rows.item(i));
        }
        console.log('Products:', products);
      });
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
