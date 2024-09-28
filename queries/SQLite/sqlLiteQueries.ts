// Libraries

// Utils
import { createSQLiteConnection } from '../../lib/SQLite';
import EMBEDDED_TABLES from '../../utils/embeddedTables';
import {
  userEmbeddedTable,
  routeDayEmbeddedTable,
  storesEmbeddedTable,
  productsEmbeddedTable,
  dayOperationsEmbeddedTable,
  routeTransactionsEmbeddedTable,
  transactionDescriptionsEmbeddedTable,
  inventoryOperationsEmbeddedTable,
  productOperationDescriptionsEmbeddedTable,
} from './embeddedDatabase';

// Interfaces
import { IUser } from '../../interfaces/interfaces';

// Function to create database
export async function createEmbeddedDatabase() {
  try {
    const sqlite = await createSQLiteConnection();
    console.log("Creating dataase")

    await sqlite.transaction(async (tx) => {
      console.log(userEmbeddedTable)
      await tx.executeSql(userEmbeddedTable);
      await tx.executeSql(routeDayEmbeddedTable);
      await tx.executeSql(storesEmbeddedTable);
      await tx.executeSql(productsEmbeddedTable);
      await tx.executeSql(dayOperationsEmbeddedTable);
      await tx.executeSql(routeTransactionsEmbeddedTable);
      await tx.executeSql(transactionDescriptionsEmbeddedTable);
      await tx.executeSql(inventoryOperationsEmbeddedTable);
      await tx.executeSql(productOperationDescriptionsEmbeddedTable);
    });
    sqlite.close();
  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Failed to create table:', error);
  }
};

// Related to users
export async function insertUser(user: IUser) {
  try {
    const {
      id_vendor,
      cellphone,
      name,
      password,
      status,
    } = user;

    console.log("Saving  user: ", user)
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`
        INSERT INTO ${EMBEDDED_TABLES.USER} (id_vendor, cellphone, name, password, status) VALUES (?, ?, ?, ?, ?)
      `, [id_vendor, cellphone, name, password, status]);
    });
    sqlite.close();
  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Failed to instert user:', error);
  }
}

/* In theory, in the system only 1 user will be stored in the system */
export async function getUser() {
  try {
    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.USER}`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        console.log(record.rows.item(index));
      }
    });

    sqlite.close();
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
}

// Functions for example
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
