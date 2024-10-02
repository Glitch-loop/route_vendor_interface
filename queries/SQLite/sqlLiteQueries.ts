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
import {
  IProductInventory,
  IUser,
  IRoute,
  IDayGeneralInformation,
  IDay,
  IRouteDay,
  IDayOperation,
  IStore,
  IInventoryOperation,
  IInventoryOperationDescription,
  ITransactionOperationDescription,
  ITransactionOperation,
  IStoreStatusDay,
} from '../../interfaces/interfaces';

// Function to create database
export async function createEmbeddedDatabase() {
  try {
    const tablesToCreate:string[] = [
      userEmbeddedTable,
      routeDayEmbeddedTable,
      storesEmbeddedTable,
      productsEmbeddedTable,
      dayOperationsEmbeddedTable,
      routeTransactionsEmbeddedTable,
      transactionDescriptionsEmbeddedTable,
      inventoryOperationsEmbeddedTable,
      productOperationDescriptionsEmbeddedTable,
    ];

    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      tablesToCreate.forEach(async(table) => {
        try {
          await tx.executeSql(table);
          console.log('Table created successfully.');
        } catch (error) {
          console.log('Error creating the database: ', error);
          throw error;
        }
      });
    });
    await sqlite.close();
  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Failed to create table:', error);
  }
}

export async function dropEmbeddedDatabase() {
  try {
    const tablesToDelete:string[] = [
      EMBEDDED_TABLES.DAY_OPERATIONS,
      EMBEDDED_TABLES.INVENTORY_OPERATIONS,
      EMBEDDED_TABLES.PRODUCTS,
      EMBEDDED_TABLES.PRODUCT_OPERATION_DESCRIPTIONS,
      EMBEDDED_TABLES.ROUTE_DAY,
      EMBEDDED_TABLES.ROUTE_TRANSACTIONS,
      EMBEDDED_TABLES.STORES,
      EMBEDDED_TABLES.TRANSACTION_DESCRIPTIONS,
      EMBEDDED_TABLES.USER,
    ];

    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      tablesToDelete.forEach(async (table) => {
        try {
          await tx.executeSql(`DROP TABLE IF EXISTS ${table};`);
          console.log('Table dropped successfully.');
        } catch (error) {
          console.error('Failed dropping the table: ', error);
        }
      });
    });
    await sqlite.close();
  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Failed dropping table:', error);
  }
}

// Related to work day
export async function insertWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay) {
  try {
    const {
      id_work_day,
      start_date,
      finish_date,
      start_petty_cash,
      final_petty_cash,
      /*Fields related to IRoute interface*/
      id_route,
      route_name,
      description,
      route_status,
      // id_vendor,
      /*Fields related to IDay interface*/
      id_day,
      // day_name,
      // order_to_show,
      /*Fields relate to IRouteDay*/
      id_route_day,
    } = workday;
    const sqlite = await createSQLiteConnection();

    await sqlite.executeSql(`INSERT INTO ${EMBEDDED_TABLES.ROUTE_DAY} (id_work_day, start_date, end_date, start_petty_cash, end_petty_cash, id_route, route_name, description, route_status, id_day, id_route_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      id_work_day,
      start_date,
      finish_date,
      start_petty_cash,
      final_petty_cash,
      /*Fields related to IRoute interface*/
      id_route,
      route_name,
      description,
      route_status,
      // id_vendor,
      /*Fields related to IDay interface*/
      id_day,
      // day_name,
      // order_to_show,
      /*Fields relate to IRouteDay*/
      id_route_day,
    ]);

    await sqlite.close();
  } catch (error) {
    console.error('Failed to insert work day:', error);
  }
}

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

    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`
        INSERT INTO ${EMBEDDED_TABLES.USER} (id_vendor, cellphone, name, password, status) VALUES (?, ?, ?, ?, ?)
      `, [id_vendor, cellphone, name, password, status]);
    });

    await sqlite.close();
  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Failed to instert user:', error);
  }
}

/* In theory, in the system only 1 user will be stored in the system */
export async function getUsers():Promise<IUser[]> {
  try {
    const users:IUser[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.USER}`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        users.push(record.rows.item(index));
      }
    });

    await sqlite.close();

    return users;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

// Related to products
/*
  This function is for when the vendor is starting a day.
  So, with this function the user will store the information that will carry
  for the route.
*/
export async function insertProducts(products: IProductInventory[]) {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      try {
        products.forEach(async (product:IProductInventory) => {
          try {
            const {
              id_product,
              product_name,
              barcode,
              weight,
              unit,
              comission,
              price,
              product_status,
              order_to_show,
              amount,
            } = product;
            console.log(product);
            await tx.executeSql(`
              INSERT INTO ${EMBEDDED_TABLES.PRODUCTS} (id_product, product_name, barcode, weight, unit, comission, price, product_status, order_to_show, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `, [
              id_product,
              product_name,
              barcode,
              weight,
              unit,
              comission,
              price,
              product_status,
              order_to_show,
              amount,
            ]);
          } catch (error) {
            console.error('Error inserting product: ', error);
          }
        });
      } catch (error) {
        console.error('Error inserting product process: ', error);
      }
    });

    await sqlite.close();
  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Error inserting product process:', error);
  }
}

/*
  This function is for when the vendor must update the information.
  To keep the things easy, this function will update all the infomration in the
  row where the record is stored.
*/
export async function updateProducts(products: IProductInventory[]) {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      products.forEach(async (product:IProductInventory) => {

        const {
          id_product,
          product_name,
          barcode,
          weight,
          unit,
          comission,
          price,
          product_status,
          order_to_show,
          amount,
        } = product;

        await tx.executeSql(`
          UPDATE ${EMBEDDED_TABLES.PRODUCTS} SET (product_name, weight, unit, comission, price, product_status, order_to_show, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          WHERE id_product = ${id_product}
        `, [
          id_product,
          product_name,
          barcode,
          weight,
          unit,
          comission,
          price,
          product_status,
          order_to_show,
          amount,
        ]);
      });
    });
    sqlite.close();
  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Failed to update products:', error);
  }
}

// Related to stores
export async function insertStores(stores: (IStore&IStoreStatusDay)[]) {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      stores.forEach(async (store:IStore&IStoreStatusDay) => {
        const {
          id_store,
          street,
          ext_number,
          colony,
          postal_code,
          address_reference,
          store_name,
          owner_name,
          cellphone,
          latitude,
          longuitude,
          id_creator,
          creation_date,
          creation_context,
          status_store,
          route_day_state,
        } = store;

        await tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.STORES} (id_store, street, ext_number, colony, postal_code, address_reference, store_name, owner_name, cellphone, latitude, longuitude, id_creator, creation_date, creation_context, status_store, route_day_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
          id_store,
          street,
          ext_number,
          colony,
          postal_code,
          address_reference,
          store_name,
          owner_name,
          cellphone,
          latitude,
          longuitude,
          id_creator,
          creation_date,
          creation_context,
          status_store,
          route_day_state,
        ]);
      });
    });
    await sqlite.close();
  } catch (error) {
    console.error('Failed to instert stores: ', error);
  }
}

export async function updateStore(store: IStore&IStoreStatusDay) {
  try {
    console.log("Updating information")
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {

      const {
        id_store,
        street,
        ext_number,
        colony,
        postal_code,
        address_reference,
        store_name,
        owner_name,
        cellphone,
        latitude,
        longuitude,
        id_creator,
        creation_date,
        creation_context,
        status_store,
        route_day_state,
      } = store;

      console.log("Store to update: ", id_store)
      await tx.executeSql(`UPDATE ${EMBEDDED_TABLES.STORES} SET street = ?, ext_number = ?, colony = ?, postal_code = ?, address_reference = ?, store_name = ?, owner_name = ?, cellphone = ?, latitude = ?, longuitude = ?, id_creator = ?, creation_date = ?, creation_context = ?, status_store = ?, route_day_state = ?
      WHERE id_store = ${id_store}`, [
        street,
        ext_number,
        colony,
        postal_code,
        address_reference,
        store_name,
        owner_name,
        cellphone,
        latitude,
        longuitude,
        id_creator,
        creation_date,
        creation_context,
        status_store,
        route_day_state,
      ]);
    });

    await sqlite.close();
  } catch (error) {
    console.error('Failed to update: ', error);
  }
}

// Related to day operations
export async function insertDayOperation(dayOperation: IDayOperation) {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      const {
        id_day_operation,
        id_item,
        id_type_operation,
        operation_order,
        current_operation,
      } = dayOperation;

      await tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.DAY_OPERATIONS} (id_day_operation, id_item, id_type_operation, operation_order,  current_operation) VALUES (?, ?, ?, ?, ?)`, [
        id_day_operation,
        id_item,
        id_type_operation,
        operation_order,
        current_operation,
      ]);
    });

    await sqlite.close();
  } catch (error) {
    console.error("Failed to insert day operation: ", error);
  }
}

export async function insertDayOperations(dayOperations: IDayOperation[]) {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      dayOperations.forEach(async (dayOperation:IDayOperation) => {
        const {
          id_day_operation,
          id_item,
          id_type_operation,
          operation_order,
          current_operation,
        } = dayOperation;

        await tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.DAY_OPERATIONS} (id_day_operation, id_item, id_type_operation, operation_order,  current_operation) VALUES (?, ?, ?, ?, ?)`, [
          id_day_operation,
          id_item,
          id_type_operation,
          operation_order,
          current_operation,
        ]);
      });
    });

    await sqlite.close();
  } catch (error) {
    console.error("Failed to instert day operations: ", error);
  }
}

export async function updateDayOperation(dayOperation: IDayOperation) {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      const {
        id_day_operation,
        id_item,
        id_type_operation,
        operation_order,
        current_operation,
      } = dayOperation;

      await tx.executeSql(`UPDATE ${EMBEDDED_TABLES.DAY_OPERATIONS} SET (id_item, id_type_operation, operation_order,  current_operation) VALUES (?, ?, ?, ?)WHERE id_day_operation = ${id_day_operation}`, [
        id_item,
        id_type_operation,
        operation_order,
        current_operation,
      ]);
    });

    await sqlite.close();
  } catch (error) {
    console.error("Fauled to update day operation: ", error);
  }
}

// Related to inventory operations
export async function insertInventoryOperation(inventoryOperation: IInventoryOperation) {
  try {
    const {
      id_inventory_operation,
      sign_confirmation,
      date,
      audit,
      id_type_of_operation,
      id_work_day,
    } = inventoryOperation;

    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`
        INSERT INTO ${EMBEDDED_TABLES.INVENTORY_OPERATIONS} (id_inventory_operation, sign_confirmation, date, audit, id_type_of_operation, id_work_day) VALUES (?, ?, ?, ?, ?, ?);
      `, [
          id_inventory_operation,
          sign_confirmation,
          date,
          audit,
          id_type_of_operation,
          id_work_day,
        ]);
    });
    await sqlite.close();
  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Failed to instert inventory operation:', error);
  }
}

export async function insertInventoryOperationDescription(inventoryOperationDescription: IInventoryOperationDescription[]) {
  try {
    const sqlite = await createSQLiteConnection();

    inventoryOperationDescription
    .forEach(async (inventoryOperationItem:IInventoryOperationDescription)=> {
      const {
        id_product_operation_description,
        price_at_moment,
        amount,
        id_inventory_operation,
        id_product,
      } = inventoryOperationItem;

      await sqlite.transaction(async (tx) => {
        await tx.executeSql(`
          INSERT INTO ${EMBEDDED_TABLES.PRODUCT_OPERATION_DESCRIPTIONS} (id_product_operation_description, price_at_moment, amount, id_inventory_operation, id_product) VALUES (?, ?, ?, ?, ?);
        `, [
            id_product_operation_description,
            price_at_moment,
            amount,
            id_inventory_operation,
            id_product,
          ]
        );
      });
    });
    await sqlite.close();
  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Failed to instert inventory operation:', error);
  }
}


// Related to transcations
export async function insertTransaction(transactionOperation: ITransactionOperation) {
  try {
    const {
      id_transaction,
      date,
      state,
      id_work_day,
      id_store,
      id_type_operation,
      id_payment_method,
    } = transactionOperation;

    console.log(transactionOperation)
    console.log("Starting information transaction")
    const sqlite = await createSQLiteConnection();

    console.log("OK1")
    console.log(sqlite)
    console.log(`INSERT INTO ${EMBEDDED_TABLES.ROUTE_TRANSACTIONS} (id_transaction, date, state, id_work_day, id_store, id_type_operation, id_payment_method) VALUES (?, ?, ?, ?, ?, ?, ?);`)
    await sqlite.transaction(async (tx) => {
      console.log("OK")
      await tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.ROUTE_TRANSACTIONS} (id_transaction, date, state, id_work_day, id_store, id_type_operation, id_payment_method) VALUES (?, ?, ?, ?, ?, ?, ?);
      `, [
          id_transaction,
          date,
          state,
          id_work_day,
          id_store,
          id_type_operation,
          id_payment_method,
      ]);
    }).catch((error) => console.error(error));
    console.log("Inserting the transaction")
    await sqlite.close();
  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Failed to instert inventory operation:', error);
  }
}

export async function insertTransactionOperationDescription(transactionOperationDescription: ITransactionOperationDescription[]) {
  try {
    const sqlite = await createSQLiteConnection();

    transactionOperationDescription
    .forEach(async (transactionDescription:ITransactionOperationDescription)=> {
      const {
        id_transaction_description,
        price_at_moment,
        amount,
        id_route_transaction,
        id_product,
      } = transactionDescription;

      await sqlite.transaction(async (tx) => {
        await tx.executeSql(`
          INSERT INTO ${EMBEDDED_TABLES.TRANSACTION_DESCRIPTIONS} (id_transaction_description, price_at_moment, amount, id_route_transaction, id_product) VALUES (?, ?, ?, ?, ?);
          `, [
            id_transaction_description,
            price_at_moment,
            amount,
            id_route_transaction,
            id_product,
          ]
        );
      });
    });
    await sqlite.close();
    console.log("Inserting the transaction description")
  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Failed to instert inventory operation:', error);
  }
}
