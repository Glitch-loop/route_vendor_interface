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
} from '../../interfaces/interfaces';

// Function to create database
export async function createEmbeddedDatabase() {
  try {
    const sqlite = await createSQLiteConnection();
    console.log("Creating database")

    await sqlite.transaction(async (tx) => {
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
}
export async function dropDatabase() {
  try {
    const sqlite = await createSQLiteConnection();
    console.log("Droping database")

    await sqlite.transaction(async (tx) => {
      for (let key in EMBEDDED_TABLES) {
        await tx.executeSql(`DROP TABLE IF EXISTS ${EMBEDDED_TABLES[key]}`);
      }
    });
    sqlite.close();
  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Failed to create table:', error);
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
      id_vendor,
      /*Fields related to IDay interface*/
      id_day,
      day_name,
      order_to_show,
      /*Fields relate to IRouteDay*/
      id_route_day,

    } = workday;
    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`INSERT INTO ${EMBEDDED_TABLES.ROUTE_DAY} (id_work_day, start_date, end_date, start_petty_cash, end_petty_cash, id_route, route_name, description, route_status, id_day, id_route_day) VALUE (?, ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?,  ?, ?)`, [
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
      id_vendor,
      /*Fields related to IDay interface*/
      id_day,
      day_name,
      order_to_show,
      /*Fields relate to IRouteDay*/
      id_route_day,
    ]);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        console.log(record.rows.item(index));
      }
    });

    sqlite.close();
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
    sqlite.close();
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

    sqlite.close();

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
          INSERT INTO ${EMBEDDED_TABLES.PRODUCTS} (id_product, product_name, weight, unit, comission, price, product_status, order_to_show, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
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
    console.error('Failed to instert products:', error);
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
export async function insertStores(stores: IStore[]) {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      stores.forEach(async (store:IStore) => {
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
        ]);
      });
    });
  } catch (error) {
    console.log('Failed to instert stores: ', error);
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

      tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.DAY_OPERATIONS} (id_day_operation, id_item, id_type_operation, operation_order,  current_operation) VALUES (?, ?, ?, ?, ?)`, [
        id_day_operation,
        id_item,
        id_type_operation,
        operation_order,
        current_operation,
      ]);
    });

    sqlite.close();
  } catch (error) {
    console.log("Failed to insert day operation: ", error);
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

    sqlite.close();
  } catch (error) {
    console.log("Failed to instert day operations: ", error);
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

      tx.executeSql(`UPDATE ${EMBEDDED_TABLES.DAY_OPERATIONS} SET (id_item, id_type_operation, operation_order,  current_operation) VALUES (?, ?, ?, ?)WHERE id_day_operation = ${id_day_operation}`, [
        id_item,
        id_type_operation,
        operation_order,
        current_operation,
      ]);
    });

    sqlite.close();
  } catch (error) {
    console.log("Fauled to update day operation: ", error);
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
        INSERT INTO ${EMBEDDED_TABLES.INVENTORY_OPERATIONS} (id_inventory_operation, sign_confirmation, date, audit, id_type_of_operation, id_work_day) VALUES (?, ?, ?, ?, ?);
      `, [
          id_inventory_operation,
          sign_confirmation,
          date,
          audit,
          id_type_of_operation,
          id_work_day,
        ]);
    });
    sqlite.close();
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
          ]);
      });
    });
    sqlite.close();
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
    } = transactionOperation;

    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`
        INSERT INTO ${EMBEDDED_TABLES.ROUTE_TRANSACTIONS} (id_transaction, date, state, id_work_day, id_store, id_type_operation) VALUES (?, ?, ?, ?, ?, ?);
      `, [
          id_transaction,
          date,
          state,
          id_work_day,
          id_store,
          id_type_operation,
      ]);
    });
    sqlite.close();
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
          ]);
      });
    });
    sqlite.close();
  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Failed to instert inventory operation:', error);
  }
}