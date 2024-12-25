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
  routeTransactionOperationsEmbeddedTable,
  routeTransactionOperationDescriptionsEmbeddedTable,
  inventoryOperationsEmbeddedTable,
  productOperationDescriptionsEmbeddedTable,
  syncQueueEmbeddedTable,
  syncHistoricEmbeddedTable,
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
  IRouteTransaction,
  IRouteTransactionOperation,
  IRouteTransactionOperationDescription,
  IStore,
  IInventoryOperation,
  IInventoryOperationDescription,
  IStoreStatusDay,
  IResponse,
  ISyncRecord,
} from '../../interfaces/interfaces';
import { createApiResponse } from '../../utils/apiResponse';

// Function to create database
export async function createEmbeddedDatabase():Promise<IResponse<null>> {
  try {
    const tablesToCreate:string[] = [
      userEmbeddedTable,
      routeDayEmbeddedTable,
      storesEmbeddedTable,
      productsEmbeddedTable,
      dayOperationsEmbeddedTable,
      routeTransactionsEmbeddedTable,
      routeTransactionOperationsEmbeddedTable,
      routeTransactionOperationDescriptionsEmbeddedTable,
      inventoryOperationsEmbeddedTable,
      productOperationDescriptionsEmbeddedTable,
      syncQueueEmbeddedTable,
      syncHistoricEmbeddedTable,
    ];

    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {

      const createTablePromises:any[] = tablesToCreate
      .map((queryToCreateTable:string) => {
        return tx.executeSql(queryToCreateTable);
      });

      Promise.all(createTablePromises);
    });

    return createApiResponse(201, null, null, 'Database created sucessfully');
  } catch(error) {
    return createApiResponse(500, null, null, 'Failed during embedded database creation (transaction creation level).');
  }
}

export async function dropEmbeddedDatabase():Promise<IResponse<null>> {
  try {
    const tablesToDelete:string[] = [
      EMBEDDED_TABLES.USER,
      EMBEDDED_TABLES.ROUTE_DAY,
      EMBEDDED_TABLES.STORES,
      EMBEDDED_TABLES.PRODUCTS,
      EMBEDDED_TABLES.DAY_OPERATIONS,
      EMBEDDED_TABLES.ROUTE_TRANSACTIONS,
      EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATIONS,
      EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATION_DESCRIPTIONS,
      EMBEDDED_TABLES.INVENTORY_OPERATIONS,
      EMBEDDED_TABLES.PRODUCT_OPERATION_DESCRIPTIONS,
      EMBEDDED_TABLES.SYNC_QUEUE,
      EMBEDDED_TABLES.SYNC_HISTORIC,
    ];
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      const dropTablePromises:any[] = tablesToDelete
      .map((tableName:string) => {
        return tx.executeSql(`DROP TABLE IF EXISTS ${tableName};`);
      });

      Promise.all(dropTablePromises);
    });
    return createApiResponse(200, null, null, 'Embedded database dropped successfully.');
  } catch(error) {
    console.log(error)
    return createApiResponse(500, null, null, 'Failed dropping database.');
  }
}

// Related to work day
export async function insertWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):
  Promise<IResponse<IRoute&IDayGeneralInformation&IDay&IRouteDay>> {
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

  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.ROUTE_DAY} (id_work_day, start_date, end_date, start_petty_cash, end_petty_cash, id_route, route_name, description, route_status, id_day, id_route_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
    });

    return createApiResponse(201, workday, null, 'Work day inserted sucessfully');
  } catch (error) {
    return createApiResponse(500, workday, null, 'Failed to insert work day');
  }
}

export async function deleteAllWorkDayInformation():Promise<IResponse<null>> {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`DELETE FROM ${EMBEDDED_TABLES.ROUTE_DAY};`);
    });

    return createApiResponse<null>(200, null, null, 'work day deleted successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting work day.');
  }
}

export async function updateWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<IResponse<IRoute&IDayGeneralInformation&IDay&IRouteDay>> {
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
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`UPDATE ${EMBEDDED_TABLES.ROUTE_DAY} SET 
        start_date = ?, 
        end_date = ?, 
        start_petty_cash = ?, 
        end_petty_cash = ?, 
        id_route = ?, 
        route_name = ?, 
        description = ?, 
        route_status = ?, 
        id_day = ?, 
        id_route_day = ?
        WHERE id_work_day = ?`, [
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
        id_work_day,
      ]);
    });

    return createApiResponse(200, workday, null, 'Work day updated sucessfully.');
  } catch (error) {
    return createApiResponse(500, workday, null, 'Failed updating work day.');
  }
}

export async function getWorkDay()
:Promise<IResponse<IRoute&IDayGeneralInformation&IDay&IRouteDay>> {
  const workDayState: IRoute&IDayGeneralInformation&IDay&IRouteDay = {
    /*Fields related to the general information.*/
    id_work_day: '',
    start_date: '',
    finish_date: '',
    start_petty_cash: 0,
    final_petty_cash: 0,
    /*Fields related to IRoute interface*/
    id_route: '',
    route_name: '',
    description: '',
    route_status: '',
    id_vendor: '',
    /*Fields related to IDay interface*/
    id_day: '',
    day_name: '',
    order_to_show: 0,
    /*Fields relate to IRouteDay*/
    id_route_day: '',
  };
  try {
    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.ROUTE_DAY};`);

    const record = result[0];


    return createApiResponse<IRoute&IDayGeneralInformation&IDay&IRouteDay>(200, record.rows.item(0), null, null);
  } catch (error) {
    return createApiResponse<IRoute&IDayGeneralInformation&IDay&IRouteDay>(500, workDayState, null, 'Failed to get the work day.');
  }
}

// Related to users
export async function insertUser(user: IUser):Promise<IResponse<IUser>> {
  const {
    id_vendor,
    cellphone,
    name,
    password,
    status,
  } = user;

  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`
        INSERT INTO ${EMBEDDED_TABLES.USER} (id_vendor, cellphone, name, password, status) VALUES (?, ?, ?, ?, ?)
      `, [id_vendor, cellphone, name, password, status]);
    });

    return createApiResponse<IUser>(201, user, null, 'User inserted sucessfully');
  } catch(error) {
    return createApiResponse<IUser>(500, user, null, 'Failed insterting user.');
  }
}

/* In theory, in the system only 1 user will be stored in the system */
export async function getUsers():Promise<IResponse<IUser[]>> {
  try {
    const users:IUser[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.USER}`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        users.push(record.rows.item(index));
      }
    });

    return createApiResponse<IUser[]>(200, users, null, null);
  } catch(error) {
    return createApiResponse<IUser[]>(500, [], null, 'Failed getting users.');
  }
}

// Related to products
/*
  Fucntion for starting a day.
  With this function is created/declared the vendor's inventory.
*/
export async function insertProducts(products: IProductInventory[])
:Promise<IResponse<IProductInventory[]>> {
  const insertedProducts:IProductInventory[] = [];
  try {
    const sqlite = await createSQLiteConnection();
    await sqlite.transaction(async (tx) => {
      for (let i = 0; i < products.length; i++) {
        const product:IProductInventory = products[i];
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

        tx.executeSql(`
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
        ]).then(() => {
          insertedProducts.push(product);
        });
      }
    });
    return createApiResponse<IProductInventory[]>(201, insertedProducts, null, 'Products inserted correctly.');
  } catch(error) {
    return createApiResponse<IProductInventory[]>(500, insertedProducts, null, 'Failed inserting products');
  }
}

/*
  This function is for when the vendor must update the information of the
  inventory.

  This function updates records in the table "products", that conceptually, stores
  the information of the product (product available for selling) but also the
  inventory (amount of the product to sale).

  This function receives the products to update, idoneally, all the product of the
  inventory.
*/
export async function updateProducts(products: IProductInventory[])
:Promise<IResponse<IProductInventory[]>> {
  const updatedProducts:IProductInventory[] = [];
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      for(let i = 0; i < products.length; i++) {
        const product:IProductInventory = products[i];
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
        tx.executeSql(`
          UPDATE ${EMBEDDED_TABLES.PRODUCTS} SET 
            product_name = ?, 
            barcode = ?,
            weight = ?, 
            unit = ?, 
            comission = ?,
            price = ?, 
            product_status = ?, 
            order_to_show = ?, 
            amount = ? 
          WHERE id_product = '${id_product}';
        `, [
          product_name,
          barcode,
          weight,
          unit,
          comission,
          price,
          product_status,
          order_to_show,
          amount,
        ]).then(() => {
          updatedProducts.push(product);
        });
      }
    });

    return createApiResponse<IProductInventory[]>(200, updatedProducts, null, 'Products updated successfully.');
  } catch(error) {

    return createApiResponse<IProductInventory[]>(500, updatedProducts, null, 'Failed update products (transaction creation level).');
  }
}

/*
  This function retrieves the products that are currently available in the
  route.

  In addition, this function retrieves the current inventory for each product.
*/
export async function getProducts():Promise<IResponse<IProductInventory[]>> {
  try {
    const product:IProductInventory[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.PRODUCTS};`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        product.push(record.rows.item(index));
      }
    });

    return createApiResponse<IProductInventory[]>(200, product, null, null);
  } catch(error) {
    return createApiResponse<IProductInventory[]>(500, [], null, 'Failed getting products.');
  }
}

export async function deleteAllProducts():Promise<IResponse<null>> {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`DELETE FROM ${EMBEDDED_TABLES.PRODUCTS};`);
    });

    return createApiResponse<null>(200, null, null, 'Inventory products deleted successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting inventory products.');
  }
}

// Related to stores
export async function insertStores(stores: (IStore&IStoreStatusDay)[])
:Promise<IResponse<(IStore&IStoreStatusDay)[]>> {
  const insertedStores:(IStore&IStoreStatusDay)[] = [];

  try {
    const sqlite = await createSQLiteConnection();
    await sqlite.transaction(async (tx) => {
      for(let i = 0; i < stores.length; i++) {
        const store:IStore&IStoreStatusDay = stores[i];
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
        tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.STORES} (id_store, street, ext_number, colony, postal_code, address_reference, store_name, owner_name, cellphone, latitude, longuitude, id_creator, creation_date, creation_context, status_store, route_day_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
        ])
        .then(() => {
          insertedStores.push(store);
        });
      }
    });

    return createApiResponse<(IStore&IStoreStatusDay)[]>(201, stores, null,
      'Stores inserted correctly.');
  } catch(error) {
    return createApiResponse<(IStore&IStoreStatusDay)[]>(500, insertedStores, null,
      'Failed inserting stores');
  }
}

export async function updateStore(store: IStore&IStoreStatusDay)
:Promise<IResponse<IStore&IStoreStatusDay>> {
  try {
    const sqlite = await createSQLiteConnection();
    await sqlite.transaction(async (tx) => {
      try {
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

        await tx.executeSql(`UPDATE ${EMBEDDED_TABLES.STORES} SET 
          street = ?, 
          ext_number = ?, 
          colony = ?, 
          postal_code = ?, 
          address_reference = ?, 
          store_name = ?, 
          owner_name = ?, 
          cellphone = ?, 
          latitude = ?, 
          longuitude = ?, 
          id_creator = ?, 
          creation_date = ?, 
          creation_context = ?, 
          status_store = ?, 
          route_day_state = ? 
          WHERE id_store = '${id_store}';`, [
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
      } catch (error) {
        return createApiResponse<IStore&IStoreStatusDay>(500, store, null, 'Failed updating the store (sql execution)');
      }
    });
    return createApiResponse<IStore&IStoreStatusDay>(200, store, null, 'Store updated successfully');
  } catch(error) {
    return createApiResponse<IStore&IStoreStatusDay>(500, store, null, 'Failed updating the store (transaction level)');
  }
}

export async function getStores():Promise<IResponse<(IStore&IStoreStatusDay)[]>> {
  try {
    const stores:(IStore&IStoreStatusDay)[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.STORES};`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        stores.push(record.rows.item(index));
      }
    });


    return createApiResponse<(IStore&IStoreStatusDay)[]>(200, stores, null, null);
  } catch(error) {
    return createApiResponse<(IStore&IStoreStatusDay)[]>(500, [], null, 'Failed getting stores.');
  }
}

export async function deleteAllStores():Promise<IResponse<null>> {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`DELETE FROM ${EMBEDDED_TABLES.STORES};`);
    });

    return createApiResponse<null>(200, null, null, 'Stores deleted successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting stores.');
  }
}

// Related to day operations
export async function insertDayOperation(dayOperation: IDayOperation)
:Promise<IResponse<IDayOperation>> {
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


    return createApiResponse<IDayOperation>(201, dayOperation, null, 'Day operation inserted successfully.');
  } catch(error) {
    return createApiResponse<IDayOperation>(500, dayOperation, null, 'Failed insterting day operation.');
  }
}

export async function insertDayOperations(dayOperations: IDayOperation[])
:Promise<IResponse<IDayOperation[]>> {
  const insertedDayOperations:IDayOperation[] = [];
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      for(let i = 0; i < dayOperations.length; i++) {
        const dayOperation:IDayOperation = dayOperations[i];

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
        ]).then(() => {
          insertedDayOperations.push(dayOperation);
        });
      }
    });

    return createApiResponse<IDayOperation[]>(201, insertedDayOperations, null, 'Day operations inserted successfully.');
  } catch(error) {
    return createApiResponse<IDayOperation[]>(500, insertedDayOperations, null, 'Failed insterting day operations.');
  }
}

export async function updateDayOperation(dayOperation: IDayOperation)
:Promise<IResponse<IDayOperation>> {
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

      await tx.executeSql(`UPDATE ${EMBEDDED_TABLES.DAY_OPERATIONS} SET     
        id_item = ?, 
        id_type_operation = ?,
        operation_order = ?,
        current_operation = ?
        WHERE id_day_operation = '${id_day_operation}';`, [
        id_item,
        id_type_operation,
        operation_order,
        current_operation,
      ]);
    });

    return createApiResponse<IDayOperation>(200, dayOperation, null, 'Day operation updated successfully.');
  } catch(error) {

    return createApiResponse<IDayOperation>(500, dayOperation, null, 'Failed updating day operation.');
  }
}

export async function getDayOperations():Promise<IResponse<IDayOperation[]>> {
  try {
    const arrDayOperations:IDayOperation[] = [];
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      try {
        const result  = await tx.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.DAY_OPERATIONS};`);

        const rows = result[1].rows;
        const length = result[1].rows.length;

        for (let index = 0; index < length; index++) {
          arrDayOperations.push(rows.item(index));
        }

      } catch (error) {
        return createApiResponse<IDayOperation[]>(500, [], null, 'Failed retrieving day operations (query execution level).');
      }
    });

    return createApiResponse<IDayOperation[]>(200, arrDayOperations, null);
  } catch(error) {
    return createApiResponse<IDayOperation[]>(500, [], null, 'Failed retrieving day operations (transaction level).');
  }
}

export async function deleteAllDayOperations():Promise<IResponse<null>> {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`DELETE FROM ${EMBEDDED_TABLES.DAY_OPERATIONS};`);
    });

    return createApiResponse<null>(200, null, null, 'Day operations deleted successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting day operations.');
  }
}

// Related to inventory operations
export async function getInventoryOperation(id_inventory_operation:string):Promise<IResponse<IInventoryOperation[]>> {
  try {
    const inventoryOperation:IInventoryOperation[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.INVENTORY_OPERATIONS} WHERE id_inventory_operation = '${id_inventory_operation}'`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        inventoryOperation.push(record.rows.item(index));
      }
    });

    return createApiResponse<IInventoryOperation[]>(200, inventoryOperation, null);
  } catch(error) {
    return createApiResponse<IInventoryOperation[]>(500, [], null, 'Failed retrieving the inventory operation.');
  }
}

export async function getAllInventoryOperations():Promise<IResponse<IInventoryOperation[]>> {
  try {
    const inventoryOperations:IInventoryOperation[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.INVENTORY_OPERATIONS}`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        inventoryOperations.push(record.rows.item(index));
      }
    });


    return createApiResponse<IInventoryOperation[]>(200, inventoryOperations, 'All the inventory operations were retrieved successfully.');
  } catch(error) {
    return createApiResponse<IInventoryOperation[]>(500, [], null, 'Failed retrieving the inventory operations.');
  }
}

export async function insertInventoryOperation(inventoryOperation: IInventoryOperation)
:Promise<IResponse<IInventoryOperation>> {
  try {
    const {
      id_inventory_operation,
      sign_confirmation,
      date,
      state,
      audit,
      id_inventory_operation_type,
      id_work_day,
    } = inventoryOperation;

    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`
        INSERT INTO ${EMBEDDED_TABLES.INVENTORY_OPERATIONS} (id_inventory_operation, sign_confirmation, date, state, audit, id_inventory_operation_type, id_work_day) VALUES (?, ?, ?, ?, ?, ?, ?);
      `, [
          id_inventory_operation,
          sign_confirmation,
          date,
          state,
          audit,
          id_inventory_operation_type,
          id_work_day,
        ]);
    });

    return createApiResponse<IInventoryOperation>(
      201,
      inventoryOperation,
      null,
      'Inventory operation inserted successfully.'
    );
  } catch(error) {
    return createApiResponse<IInventoryOperation>(
      500,
      inventoryOperation,
      null,
      'Failed inserting inventory operation.'
    );
  }
}

export async function updateInventoryOperation(inventoryOperation: IInventoryOperation)
:Promise<IResponse<IInventoryOperation>> {
  try {
    const {
      id_inventory_operation,
      sign_confirmation,
      date,
      audit,
      state,
      id_inventory_operation_type,
      id_work_day,
    } = inventoryOperation;

    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`
        UPDATE ${EMBEDDED_TABLES.INVENTORY_OPERATIONS}  SET 
        sign_confirmation = ?, 
        date = ?, 
        audit = ?,
        state = ?, 
        id_inventory_operation_type = ?, 
        id_work_day = ?
        WHERE id_inventory_operation = ?;
      `, [
          sign_confirmation,
          date,
          audit,
          state,
          id_inventory_operation_type,
          id_work_day,
          id_inventory_operation,
        ]);
    });

    return createApiResponse<IInventoryOperation>(
      200,
      inventoryOperation,
      null,
      'Inventory operation updated successfully.'
    );
  } catch(error) {
    console.log(error)
    return createApiResponse<IInventoryOperation>(
      500,
      inventoryOperation,
      null,
      'Failed updating inventory operation.'
    );
  }
}

export async function getInventoryOperationDescription(id_inventory_operation:string)
:Promise<IResponse<IInventoryOperationDescription[]>> {
  try {
    const inventoryOperation:IInventoryOperationDescription[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.PRODUCT_OPERATION_DESCRIPTIONS} WHERE id_inventory_operation = '${id_inventory_operation}'`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        inventoryOperation.push(record.rows.item(index));
      }
    });

    return createApiResponse<IInventoryOperationDescription[]>(200, inventoryOperation, null, 'The inventory operation description was retrieved successfully.');
  } catch(error) {
    return createApiResponse<IInventoryOperationDescription[]>(500, [], null, 'Failed retrieving the inventory operation description.');
  }
}

export async function getAllInventoryOperationDescription():Promise<IResponse<IInventoryOperationDescription[]>> {
  try {
    const inventoryOperation:IInventoryOperationDescription[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite
      .executeSql(`SELECT * FROM ${EMBEDDED_TABLES.PRODUCT_OPERATION_DESCRIPTIONS}`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        inventoryOperation.push(record.rows.item(index));
      }
    });

    return createApiResponse<IInventoryOperationDescription[]>(200, inventoryOperation, null, 'All the inventory operations descriptions were retrieved successfully.');
  } catch(error) {
    return createApiResponse<IInventoryOperationDescription[]>(500, [], null, 'Failed retrieving all the inventory operation descriptions.');
  }
}

export async function insertInventoryOperationDescription(inventoryOperationDescriptions: IInventoryOperationDescription[])
:Promise<IResponse<IInventoryOperationDescription[]>> {

  const insertedInventoryOperationDescription:IInventoryOperationDescription[] = [];
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      for(let i = 0; i < inventoryOperationDescriptions.length; i++) {
        const inventoryOperationDescription:IInventoryOperationDescription
        = inventoryOperationDescriptions[i];

        const {
          id_product_operation_description,
          price_at_moment,
          amount,
          id_inventory_operation,
          id_product,
        } = inventoryOperationDescription;

        tx.executeSql(`
          INSERT INTO ${EMBEDDED_TABLES.PRODUCT_OPERATION_DESCRIPTIONS} (id_product_operation_description, price_at_moment, amount, id_inventory_operation, id_product) VALUES (?, ?, ?, ?, ?);
        `, [
            id_product_operation_description,
            price_at_moment,
            amount,
            id_inventory_operation,
            id_product,
          ]
        ).then(() => {
          insertedInventoryOperationDescription.push(inventoryOperationDescription);
        });
      }
    });


    return createApiResponse<IInventoryOperationDescription[]>(
      201,
      insertedInventoryOperationDescription,
      null,
      'Inventory operation description inserted successfully.'
    );
  } catch(error) {
    return createApiResponse<IInventoryOperationDescription[]>(
      500,
      insertedInventoryOperationDescription,
      null,
      'Failed inserting inventory operation description.'
    );
  }
}

export async function deleteAllInventoryOperations():Promise<IResponse<null>> {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`DELETE FROM ${EMBEDDED_TABLES.INVENTORY_OPERATIONS};`);
    });

    return createApiResponse<null>(200, null, null, 'Inventory operations deleted successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting inventory operations.');
  }
}

export async function deleteAllInventoryOperationsDescriptions():Promise<IResponse<null>> {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx
      .executeSql(`DELETE FROM ${EMBEDDED_TABLES.PRODUCT_OPERATION_DESCRIPTIONS};`);
    });

    return createApiResponse<null>(200, null, null, 'Inventory operation descriptions deleted successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting Inventory operation descriptions.');
  }
}


export async function deleteInventoryOperationsById(inventoryOperation: IInventoryOperation):Promise<IResponse<null>> {
  try {
    const {
      id_inventory_operation,
    } = inventoryOperation;


    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`DELETE FROM ${EMBEDDED_TABLES.INVENTORY_OPERATIONS} WHERE id_inventory_operation = ?;`, [id_inventory_operation]);
    });

    return createApiResponse<null>(200, null, null, 'Route transaction deleted (by id) successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting route transaction by id.');
  }
}

export async function deleteInventoryOperationDescriptionsById(inventoryOperationDescriptions: IInventoryOperationDescription[])
:Promise<IResponse<IInventoryOperationDescription[]>> {
  const inventoryOperationDescriptionsDeleted
  :IInventoryOperationDescription[] = [];
  try {
    const sqlite = await createSQLiteConnection();

    for (let i = 0; i < inventoryOperationDescriptions.length; i++) {
      const {
        id_product_operation_description,
      } = inventoryOperationDescriptions[i];
        await sqlite.transaction(async (tx) => {
          await tx.executeSql(`DELETE FROM ${EMBEDDED_TABLES.PRODUCT_OPERATION_DESCRIPTIONS} WHERE id_product_operation_description = ?;`, [id_product_operation_description]);
        });
        inventoryOperationDescriptionsDeleted.push(inventoryOperationDescriptions[i]);
    }

    return createApiResponse<IInventoryOperationDescription[]>(200, inventoryOperationDescriptionsDeleted, null, 'Route transactions deleted successfully.');
  } catch(error) {
    return createApiResponse<IInventoryOperationDescription[]>(500, inventoryOperationDescriptionsDeleted, null, 'Failed deleting route transactions.');
  }
}

// Related to transcations
export async function insertRouteTransaction(transactionOperation: IRouteTransaction):Promise<IResponse<IRouteTransaction>> {
  try {
    const {
      id_route_transaction,
      date,
      state,
      cash_received,
      id_work_day,
      id_store,
      id_payment_method,
    } = transactionOperation;

    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      try {
        await tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.ROUTE_TRANSACTIONS} (id_route_transaction, date, state, cash_received, id_work_day, id_payment_method, id_store) VALUES (?, ?, ?, ?, ?, ?, ?);
        `,
        [
          id_route_transaction,
          date,
          state,
          cash_received,
          id_work_day,
          id_payment_method,
          id_store,
        ]);
      } catch (error) {
        return createApiResponse<IRouteTransaction>(500, transactionOperation, null, 'Failed inserting route transaction (query execution level).');
      }
    });

    return createApiResponse<IRouteTransaction>(201, transactionOperation, null, 'Route transaction inserted successfully.');
  } catch(error) {
    return createApiResponse<IRouteTransaction>(500, transactionOperation, null, 'Failed inserting route transaction (transaction creation level).');
  }
}

export async function insertRouteTransactionOperation(transactionOperation: IRouteTransactionOperation):Promise<IResponse<IRouteTransactionOperation>> {
  try {
    const {
      id_route_transaction_operation,
      id_route_transaction,
      id_route_transaction_operation_type,
    } = transactionOperation;

    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATIONS} (id_route_transaction_operation, id_route_transaction, id_route_transaction_operation_type) VALUES (?, ?, ?);
      `,
      [
        id_route_transaction_operation,
        id_route_transaction,
        id_route_transaction_operation_type,
      ]);
    });

    return createApiResponse<IRouteTransactionOperation>(201, transactionOperation, null, 'Route transaction operation inserted successfully.');
  } catch(error) {
    return createApiResponse<IRouteTransactionOperation>(500, transactionOperation, null, 'Failed inserting route transaction operation (transaction creation level).');
  }
}

export async function insertRouteTransactionOperationDescription(transactionOperationDescriptions: IRouteTransactionOperationDescription[])
:Promise<IResponse<IRouteTransactionOperationDescription[]>> {
  const insertedTransactionOperationDescription:IRouteTransactionOperationDescription[] = [];
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      for(let i = 0; i < transactionOperationDescriptions.length; i++) {
        const transactionOperationDescription:IRouteTransactionOperationDescription
        = transactionOperationDescriptions[i];

        const {
          id_route_transaction_operation_description,
          price_at_moment,
          amount,
          id_route_transaction_operation,
          id_product,
        } = transactionOperationDescription;

        tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATION_DESCRIPTIONS} (id_route_transaction_operation_description, price_at_moment, amount, id_route_transaction_operation, id_product) VALUES (?, ?, ?, ?, ?);
          `, [
            id_route_transaction_operation_description,
            price_at_moment,
            amount,
            id_route_transaction_operation,
            id_product,
          ]
        ).then(() => {
          insertedTransactionOperationDescription.push(transactionOperationDescription);
        });
      }
    });
    return createApiResponse<IRouteTransactionOperationDescription[]>(
      201,
      insertedTransactionOperationDescription,
      null,
      'Route transaction operation description inserted successfully.'
    );
  } catch(error) {
    return createApiResponse<IRouteTransactionOperationDescription[]>(
      500,
      insertedTransactionOperationDescription,
      null,
      'Failed inserting route transaction operation description (transaction creation level).'
    );
  }
}

export async function getRouteTransactionByStore(id_store:string):Promise<IResponse<IRouteTransaction[]>> {
  try {
    const transactions:IRouteTransaction[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.ROUTE_TRANSACTIONS} WHERE id_store = '${id_store}';`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        transactions.push(record.rows.item(index));
      }
    });

    return createApiResponse<IRouteTransaction[]>(200, transactions, null, null);
  } catch(error) {
    return createApiResponse<IRouteTransaction[]>(
      500,
      [],
      null,
      'Failed retrieving the route transactions of the store.');
  }
}

export async function getRouteTransactionOperations(id_route_transaction:string):Promise<IResponse<IRouteTransactionOperation[]>> {
  try {
    const transactionsOperations:IRouteTransactionOperation[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATIONS} WHERE id_route_transaction = '${id_route_transaction}';`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        transactionsOperations.push(record.rows.item(index));
      }
    });

    return createApiResponse<IRouteTransactionOperation[]>(200, transactionsOperations, null, null);
  } catch(error) {
    return createApiResponse<IRouteTransactionOperation[]>(500, [], null, 'Failed retrieving the transaction operations of the route transaction');
  }
}

export async function getRouteTransactionOperationDescriptions(id_route_transaction_operation:string):Promise<IResponse<IRouteTransactionOperationDescription[]>> {
  try {
    const transactionsOperationDescriptions:IRouteTransactionOperationDescription[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATION_DESCRIPTIONS} WHERE id_route_transaction_operation = '${id_route_transaction_operation}';`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        transactionsOperationDescriptions.push(record.rows.item(index));
      }
    });

    return createApiResponse<IRouteTransactionOperationDescription[]>(200, transactionsOperationDescriptions, null, null);
  } catch(error) {
    return createApiResponse<IRouteTransactionOperationDescription[]>(500, [], null, 'Failed retrieving the transaction operations description of the route transaction operation');
  }
}

export async function getAllRouteTransactions():Promise<IResponse<IRouteTransaction[]>> {
  try {
    const routeTransactions:IRouteTransaction[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite
      .executeSql(`SELECT * FROM ${EMBEDDED_TABLES.ROUTE_TRANSACTIONS}`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        routeTransactions.push(record.rows.item(index));
      }
    });

    return createApiResponse<IRouteTransaction[]>(200, routeTransactions, null, 'All the route transactions were retrieved successfully.');
  } catch(error) {
    return createApiResponse<IRouteTransaction[]>(500, [], null, 'Failed retrieving all the route transactions.');
  }
}

export async function getAllRouteTransactionsOperations():Promise<IResponse<IRouteTransactionOperation[]>> {
  try {
    const routeTransactionsOperations:IRouteTransactionOperation[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite
      .executeSql(`SELECT * FROM ${EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATIONS}`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        routeTransactionsOperations.push(record.rows.item(index));
      }
    });

    return createApiResponse<IRouteTransactionOperation[]>(200, routeTransactionsOperations, null, 'All the route transactions operations were retrieved successfully.');
  } catch(error) {
    return createApiResponse<IRouteTransactionOperation[]>(500, [], null, 'Failed retrieving all the route transactions operations.');
  }
}

export async function getAllRouteTransactionsOperationDescriptions():Promise<IResponse<IRouteTransactionOperationDescription[]>> {
  try {
    const routeTransactionsOperationsDescriptions:IRouteTransactionOperationDescription[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite
      .executeSql(`SELECT * FROM ${EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATION_DESCRIPTIONS}`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        routeTransactionsOperationsDescriptions.push(record.rows.item(index));
      }
    });

    return createApiResponse<IRouteTransactionOperationDescription[]>(200, routeTransactionsOperationsDescriptions, null, 'All the route transactions operations descriptions were retrieved successfully.');
  } catch(error) {
    return createApiResponse<IRouteTransactionOperationDescription[]>(500, [], null, 'Failed retrieving all the route transactions operation descriptions.');
  }
}

export async function updateTransaction(routeTransaction: IRouteTransaction):Promise<IResponse<IRouteTransaction>> {
  try {
    const {
      id_route_transaction,
      date,
      state,
      id_work_day,
      id_store,
      id_payment_method,
    } = routeTransaction;

    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
        await tx.executeSql(`UPDATE ${EMBEDDED_TABLES.ROUTE_TRANSACTIONS} SET  
          date = ?, 
          state = ?, 
          id_work_day = ?, 
          id_payment_method = ?, 
          id_store = ?
          WHERE id_route_transaction = ?;
        `,
        [
          date,
          state,
          id_work_day,
          id_payment_method,
          id_store,
          id_route_transaction,
        ]);
    });
    return createApiResponse<IRouteTransaction>(200, routeTransaction, null, 'Route transaction operation description inserted successfully.');
  } catch(error) {
    return createApiResponse<IRouteTransaction>(500, routeTransaction, null, 'Failed updating route transaction (transaction creation level).');
  }
}

export async function deleteAllRouteTransactions():Promise<IResponse<null>> {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`DELETE FROM ${EMBEDDED_TABLES.ROUTE_TRANSACTIONS};`);
    });

    return createApiResponse<null>(200, null, null, 'Route transactions deleted successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting route transactions.');
  }
}

export async function deleteAllRouteTransactionOperations():Promise<IResponse<null>> {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx
      .executeSql(`DELETE FROM ${EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATIONS};`);
    });

    return createApiResponse<null>(200, null, null, 'Route transaction operation descriptions deleted successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting route transaction operations.');
  }
}

export async function deleteAllRouteTransactionOperationDescriptions():Promise<IResponse<null>> {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx
      .executeSql(`DELETE FROM ${EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATION_DESCRIPTIONS};`);
    });

    return createApiResponse<null>(200, null, null, 'Route transactions operations  descriptions deleted successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting route transaction operation descriptions.');
  }
}

export async function deleteRouteTransactionById(routeTransaction:IRouteTransaction)
:Promise<IResponse<null>> {
  try {
    const { id_route_transaction } = routeTransaction;


    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`DELETE FROM ${EMBEDDED_TABLES.ROUTE_TRANSACTIONS} WHERE id_route_transaction = ?;`, [id_route_transaction]);
    });

    return createApiResponse<null>(200, null, null, 'Route transaction deleted successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting route transaction.');
  }
}

export async function deleteRouteTransactionOperationById(routeTransactionOperation:IRouteTransactionOperation)
:Promise<IResponse<null>> {
  try {
    const { id_route_transaction_operation } = routeTransactionOperation;

    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx
      .executeSql(`DELETE FROM ${EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATIONS} WHERE id_route_transaction_operation = ?;`,
        [id_route_transaction_operation]);
    });

    return createApiResponse<null>(200, null, null, 'Route transaction operation description deleted successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting route transaction operation.');
  }
}

export async function deleteRouteTransactionOperationDescriptionsById(routeTransactionOperationDescription
:IRouteTransactionOperationDescription[]):Promise<IResponse<null>> {
  try {
    const sqlite = await createSQLiteConnection();

    const totalOperationDescriptions:number = routeTransactionOperationDescription.length;

    await sqlite.transaction(async (tx) => {
      for (let i = 0; i < totalOperationDescriptions; i++) {
        const { id_route_transaction_operation_description } = routeTransactionOperationDescription[i];
        try {
          await tx
          .executeSql(`DELETE FROM ${EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATION_DESCRIPTIONS} WHERE id_route_transaction_operation_description = ?;`, 
          [ id_route_transaction_operation_description ]);
        } catch (error) {
          return createApiResponse<null>(500, null, null, 'Failed deleting route transaction operation description (loop level).');
        }
      }
    });

    return createApiResponse<null>(200, null, null, 'Route transactions operations description deleted successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting route transaction operation description (function level).');
  }
}

// Related to synchronizaion
export async function insertSyncQueueRecord(recordToSync: ISyncRecord):Promise<IResponse<null>> {
  try {
    const {
      id_record,
      status,
      payload,
      table_name,
      action,
      timestamp,
    } = recordToSync;

    if (typeof payload === 'string' && id_record !== '') {
      /* Since "payload" can be of different type of interfaces, it is needed to guarantee that it is a string to avoid column type issues in the embedded database. */
      const sqlite = await createSQLiteConnection();
      await sqlite.transaction(async (tx) => {
        await tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.SYNC_QUEUE} (id_record, status, payload,table_name, action, timestamp) VALUES (?, ?, ?, ?, ?, ?)`, [
          id_record,
          status,
          payload,
          table_name,
          action,
          timestamp,
        ]);
      });
      return createApiResponse<null>(201, null, null, 'Record has been inserted successfully.');
    } else {
      return createApiResponse<null>(400, null, null, 'Failed inserting record in the sync queue: Payload must be a string.');
    }
  } catch (error) {
    console.error(error)
    return createApiResponse<null>(500, null, null, 'Failed inserting record in the sync queue.');
  }
}

export async function insertSyncQueueRecords(recordsToSync: ISyncRecord[]):Promise<IResponse<ISyncRecord[]>> {
  const insertedRecordsToSync:ISyncRecord[] = [];
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      let totalRecordsToSync:number = recordsToSync.length;
      for (let  i = 0; i < totalRecordsToSync; i++) {
        const recordToSync:ISyncRecord = recordsToSync[i];
        const {
          id_record,
          status,
          payload,
          table_name,
          action,
          timestamp,
        } = recordToSync;

        if (typeof payload === 'string' && id_record !== '') {
          /* Since "payload" can be of different type of interfaces, it is needed to guarantee that it is a string to avoid column type issues in the embedded database. */
          tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.SYNC_QUEUE} (id_record, status, payload,table_name, action, timestamp) VALUES (?, ?, ?, ?, ?, ?)`, [
            id_record,
            status,
            payload,
            table_name,
            action,
            timestamp,
          ]).then(() => {
            insertedRecordsToSync.push(recordToSync);
          });

        } else {
          return createApiResponse<ISyncRecord[]>(
            400,
            insertedRecordsToSync,
            null,
            'Failed inserting record in the sync queue: Payload must be a string.'
          );
        }
      }
    });

    return createApiResponse<ISyncRecord[]>(
      201,
      insertedRecordsToSync,
      null,
      'Record to sync has been inserted successfully.'
    );
  } catch(error) {
    return createApiResponse<ISyncRecord[]>(
      500,
      insertedRecordsToSync,
      null,
      'Failed insterting day operations.'
    );
  }
}

export async function updateSyncQueueRecords(recordsToSync: ISyncRecord[]):Promise<IResponse<ISyncRecord[]>> {
  const insertedRecordsToSync:ISyncRecord[] = [];
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      let totalRecordsToSync:number = recordsToSync.length;
      for (let i = 0; i < totalRecordsToSync; i++) {
        const recordToSync:ISyncRecord = recordsToSync[i];
        const {
          id_record,
          status,
          payload,
          table_name,
          action,
          timestamp,
        } = recordToSync;

        if (typeof payload === 'string' && id_record !== '') {
          /* Since "payload" can be of different type of interfaces, it is needed to guarantee that it is a string to avoid column type issues in the embedded database. */
          tx.executeSql(`UPDATE ${EMBEDDED_TABLES.SYNC_QUEUE} 
            SET
            status = ?, 
            payload = ?,
            table_name = ?, 
            action = ?, 
            timestamp = ? 
            WHERE id_record = ? and action = ?;
            `, [
            status,
            payload,
            table_name,
            action,
            timestamp,
            id_record,
            action,
          ]).then(() => {
            insertedRecordsToSync.push(recordToSync);
          });

        } else {
          return createApiResponse<ISyncRecord[]>(
            400,
            insertedRecordsToSync,
            null,
            'Failed inserting record in the sync queue: Payload must be a string.'
          );
        }
      }
    });

    return createApiResponse<ISyncRecord[]>(
      201,
      insertedRecordsToSync,
      null,
      'Record to sync has been inserted successfully.'
    );
  } catch(error) {
    return createApiResponse<ISyncRecord[]>(
      500,
      insertedRecordsToSync,
      null,
      'Failed insterting day operations.'
    );
  }
}

export async function deleteSyncQueueRecord(recordToSync: ISyncRecord):Promise<IResponse<null>> {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      const {
        id_record,
        action,
       } = recordToSync;

      await tx.executeSql(`DELETE FROM ${EMBEDDED_TABLES.SYNC_QUEUE} WHERE id_record = ? AND action = ?`, [ id_record, action ]);

    });
    return createApiResponse<null>(200, null, null, 'Record to sync has been deleted successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting day operations.');
  }
}

export async function deleteSyncQueueRecords(deleteRecordsToSync: ISyncRecord[]):Promise<IResponse<ISyncRecord[]>> {
  const deletedRecordsToSync:ISyncRecord[] = [];
  try {
    console.log("Deleting records: ", deleteRecordsToSync.length)
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      let totalRecordsToSync:number = deleteRecordsToSync.length;

      for (let  i = 0; i < totalRecordsToSync; i++){
        const deleteRecordToSync = deleteRecordsToSync[i];
        const { id_record, action } = deleteRecordToSync;
        console.log("status: ", action, " - record: ", id_record)
        tx.executeSql(`DELETE FROM ${EMBEDDED_TABLES.SYNC_QUEUE} WHERE id_record = ? AND action = ?`, [ id_record, action ]).then(() => {
          deletedRecordsToSync.push(deleteRecordToSync);
        });
      }
    });

    console.log("Deleted records: ", deletedRecordsToSync.length)
    return createApiResponse<ISyncRecord[]>(
      200,
      deletedRecordsToSync,
      null,
      'Record to sync has been deleted successfully.'
    );
  } catch(error) {
    console.log("error: ", error)
    return createApiResponse<ISyncRecord[]>(
      500,
      deletedRecordsToSync,
      null,
      'Failed deleting day operations.'
    );
  }
}

export async function deleteAllSyncQueueRecords():Promise<IResponse<null>> {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx
      .executeSql(`DELETE FROM ${EMBEDDED_TABLES.SYNC_QUEUE};`);
    });

    return createApiResponse<null>(200, null, null, 'Records to sync deleted successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting records to sync.');
  }
}

export async function getAllSyncQueueRecords():Promise<IResponse<ISyncRecord[]>> {
  try {
    const syncQueueRecords:ISyncRecord[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.SYNC_QUEUE}`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        syncQueueRecords.push(record.rows.item(index));
      }
    });
    return createApiResponse<ISyncRecord[]>(200, syncQueueRecords, 'All the sync queue records were retrieved successfully.');
  } catch(error) {
    console.log(error)
    return createApiResponse<ISyncRecord[]>(500, [], null, 'Failed retrieving the sync queue records.');
  }
}

export async function insertSyncHistoricRecord(recordToSync: ISyncRecord):Promise<IResponse<null>> {
  try {
    const {
      id_record,
      status,
      payload,
      table_name,
      action,
      timestamp,
    } = recordToSync;

    if (typeof payload === 'string') {
      /* Since "payload" can be of different type of interfaces, it is needed to guarantee that it is a string to avoid column type issues in the embedded database. */
      const sqlite = await createSQLiteConnection();
      await sqlite.transaction(async (tx) => {
        await tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.SYNC_HISTORIC} (id_record, status, payload,table_name, action, timestamp) VALUES (?, ?, ?, ?, ?, ?)`, [
          id_record,
          status,
          payload,
          table_name,
          action,
          timestamp,
        ]);
      });
      return createApiResponse<null>(201, null, null, 'Record has been inserted successfully.');
    } else {
      return createApiResponse<null>(400, null, null, 'Failed inserting record in the sync historic: Payload must be a string.');
    }
  } catch (error) {
    return createApiResponse<null>(500, null, null, 'Failed inserting record in the sync historic.');
  }
}

export async function insertSyncHistoricRecords(recordsToSync: ISyncRecord[]):Promise<IResponse<ISyncRecord[]>> {
  const insertedRecordsToSync:ISyncRecord[] = [];
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      let totalRecordsToSync:number = recordsToSync.length;
      for (let  i = 0; i < totalRecordsToSync; i++) {
        const recordToSync = recordsToSync[i];

        const {
          id_record,
          status,
          payload,
          table_name,
          action,
          timestamp,
        } = recordsToSync[i];

        if (typeof payload === 'string') {
          /* Since "payload" can be of different type of interfaces, it is needed to guarantee that it is a string to avoid column type issues in the embedded database. */
          tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.SYNC_HISTORIC} (id_record, status, payload,table_name, action, timestamp) VALUES (?, ?, ?, ?, ?, ?)`, [
            id_record,
            status,
            payload,
            table_name,
            action,
            timestamp,
          ])
          .then(() => {
            insertedRecordsToSync.push(recordToSync);
          });
        } else {
          return createApiResponse<ISyncRecord[]>(400, insertedRecordsToSync, null, 'Failed inserting record in the sync historic: Payload must be a string.');
        }
      }
    });
    return createApiResponse<ISyncRecord[]>(201, insertedRecordsToSync, null, 'Record has been inserted successfully.');
  } catch(error) {
    return createApiResponse<ISyncRecord[]>(500, insertedRecordsToSync, null, 'Failed insterting record in the sync historic.');
  }
}

export async function deleteSyncHistoricRecordById(recordToSync: ISyncRecord)
:Promise<IResponse<null>> {
  try {
    const { id_record, action } = recordToSync;


    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`DELETE FROM ${EMBEDDED_TABLES.SYNC_HISTORIC}  WHERE id_record = ? AND action = ?`, [id_record, action]);
    });

    return createApiResponse<null>(200, null, null, 'Historic record deleted successfully.');
  } catch(error) {
    return createApiResponse<null>(500, null, null, 'Failed deleting historic record.');
  }
}


export async function getAllSyncHistoricRecords():Promise<IResponse<ISyncRecord[]>> {
  try {
    const syncQueueRecords:ISyncRecord[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.SYNC_HISTORIC}`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        syncQueueRecords.push(record.rows.item(index));
      }
    });

    return createApiResponse<ISyncRecord[]>(200, syncQueueRecords, 'All the sync historic records were retrieved successfully.');
  } catch(error) {
    return createApiResponse<ISyncRecord[]>(500, [], null, 'Failed retrieving the sync historic records.');
  }
}
