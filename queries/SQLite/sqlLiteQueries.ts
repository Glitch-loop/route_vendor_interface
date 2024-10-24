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
      routeTransactionOperationsEmbeddedTable,
      routeTransactionOperationDescriptionsEmbeddedTable,
      inventoryOperationsEmbeddedTable,
      productOperationDescriptionsEmbeddedTable,
    ];

    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      try {
        tablesToCreate.forEach(async (table:string) => {
          try {
            await tx.executeSql(table);
            console.log('Table created successfully.');
          } catch (error) {
            console.error('Error creating the database: ', error);
          }
        });
      } catch (error) {
        console.error('There were an error during the execution of the for each: ', error);
      }
    });
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


  } catch (error) {
    console.error('Failed to insert work day:', error);
  }
}

export async function getWorkDay():Promise<IRoute&IDayGeneralInformation&IDay&IRouteDay> {
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



    return record.rows.item(0);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return workDayState;
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
  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Error inserting product process:', error);
  }
}

/*
  This function is for when the vendor must update the information of the inventory.

  This function update records in the table "products" that store the product information but also
  the inventory (amount for each product).

  To keep things easy, this function will update all the infomration in the
  row where the record is stored.
*/
export async function updateProducts(products: IProductInventory[]) {
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

            await tx.executeSql(`
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
            ]);
          } catch (error) {
            console.error('Failed to update products:', error);
          }
        });
      } catch (error) {
        console.error('Failed to update products (transaction execution):', error);
      }
    });

  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Failed to update products:', error);
  }
}

/*
  This function retrieves the products that are currently available in the
  route.

  In addition, this function retrieves the current inventory for each product.
*/
export async function getProducts():Promise<IProductInventory[]> {
  try {
    const product:IProductInventory[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.PRODUCTS};`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        product.push(record.rows.item(index));
      }
    });



    return product;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
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

  } catch (error) {
    console.error('Failed to instert stores: ', error);
  }
}

export async function updateStore(store: IStore&IStoreStatusDay) {
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
        console.error('Something was wrong during store updation: ', error);
      }
    });


  } catch (error) {
    console.error('Failed to update the store: ', error);
  }
}

export async function getStores():Promise<(IStore&IStoreStatusDay)[]> {
  try {
    const stores:(IStore&IStoreStatusDay)[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.STORES};`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        stores.push(record.rows.item(index));
      }
    });



    return stores;
  } catch (error) {
    console.error('Failed to fetch stores:', error);
    return [];
  }
}

// Related to day operations
export async function insertDayOperation(dayOperation: IDayOperation) {
  try {
    const sqlite = await createSQLiteConnection();
    console.log("Inserting day operation: ", dayOperation)
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


  } catch (error) {
    console.error('Failed to instert day operations: ', error);
  }
}

export async function updateDayOperation(dayOperation: IDayOperation) {
  try {
    console.log("Updating in database: ", dayOperation);

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


  } catch (error) {
    console.error('Failed to update day operation: ', error);
  }
}

export async function deleteAllDayOperations() {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      await tx.executeSql(`DELETE FROM ${EMBEDDED_TABLES.DAY_OPERATIONS};`);
    });


  } catch (error) {
    console.error('Failed to delete all the day operations: ', error);
  }
}

export async function getDayOperations():Promise<IDayOperation[]> {
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
        console.error('Inside: Something was wrong during day operation retrieving transaction: ', error);
      }
    });

    return arrDayOperations;
  } catch (error) {
    console.error('Something was wrong during day operation retrieving: ', error);
    return [];
  }
}

// Related to inventory operations
export async function getInventoryOperation(id_inventory_operation:string):Promise<IInventoryOperation[]> {
  try {
    const inventoryOperation:IInventoryOperation[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.INVENTORY_OPERATIONS} WHERE id_inventory_operation = '${id_inventory_operation}'`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        inventoryOperation.push(record.rows.item(index));
      }
    });



    return inventoryOperation;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

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

  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Failed to instert inventory operation:', error);
  }
}

export async function getInventoryOperationDescription(id_inventory_operation:string):Promise<IInventoryOperationDescription[]> {
  try {
    const inventoryOperation:IInventoryOperationDescription[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.PRODUCT_OPERATION_DESCRIPTIONS} WHERE id_inventory_operation = '${id_inventory_operation}'`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        inventoryOperation.push(record.rows.item(index));
      }
    });



    return inventoryOperation;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
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

  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Failed to instert inventory operation:', error);
  }
}

// Related to transcations
export async function insertRouteTransaction(transactionOperation: IRouteTransaction) {
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
        console.error('Something was wrong during "route transacion" instertion:', error);
      }
    });


  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
      console.error('Something was wrong during "route transacion" instertion:', error);
  }
}

export async function insertRouteTransactionOperation(transactionOperation: IRouteTransactionOperation) {
  try {
    const {
      id_route_transaction_operation,
      id_route_transaction,
      id_route_transaction_operation_type,
    } = transactionOperation;

    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      try {
        await tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATIONS} (id_route_transaction_operation, id_route_transaction, id_route_transaction_operation_type) VALUES (?, ?, ?);
        `,
        [
          id_route_transaction_operation,
          id_route_transaction,
          id_route_transaction_operation_type,
        ]);
      } catch (error) {
        console.error('Something was wrong during "route transacion operation" instertion:', error);
      }
    });


  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
    console.error('Something was wrong during "route transacion operation" instertion:', error);
  }
}

export async function insertRouteTransactionOperationDescription(transactionOperationDescription: IRouteTransactionOperationDescription[]) {
  try {
    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      transactionOperationDescription
        .forEach(async (transactionDescription:IRouteTransactionOperationDescription)=> {
        try {
          const {
            id_route_transaction_operation_description,
            price_at_moment,
            amount,
            id_route_transaction_operation,
            id_product,
          } = transactionDescription;

          await tx.executeSql(`INSERT INTO ${EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATION_DESCRIPTIONS} (id_route_transaction_operation_description, price_at_moment, amount, id_route_transaction_operation, id_product) VALUES (?, ?, ?, ?, ?);
            `, [
              id_route_transaction_operation_description,
              price_at_moment,
              amount,
              id_route_transaction_operation,
              id_product,
            ]
          );
        } catch (error) {
          console.error('Something was wrong during "route transacion operation description" instertion:', error);
        }
      });
    });


  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
      console.error('Something was wrong during "route transacion operation description" instertion:', error);
  }
}

export async function getRouteTransactionByStore(id_store:string):Promise<IRouteTransaction[]> {
  try {
    const transactions:IRouteTransaction[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.ROUTE_TRANSACTIONS} WHERE id_store = '${id_store}';`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        transactions.push(record.rows.item(index));
      }
    });



    return transactions;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function getRouteTransactionOperations(id_route_transaction:string):Promise<IRouteTransactionOperation[]> {
  try {
    const transactionsOperations:IRouteTransactionOperation[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATIONS} WHERE id_route_transaction = '${id_route_transaction}';`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        transactionsOperations.push(record.rows.item(index));
      }
    });



    return transactionsOperations;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function getRouteTransactionOperationDescriptions(id_route_transaction_operation:string):Promise<IRouteTransactionOperationDescription[]> {
  try {
    const transactionsOperationDescriptions:IRouteTransactionOperationDescription[] = [];

    const sqlite = await createSQLiteConnection();
    const result = await sqlite.executeSql(`SELECT * FROM ${EMBEDDED_TABLES.ROUTE_TRANSACTION_OPERATION_DESCRIPTIONS} WHERE id_route_transaction_operation = '${id_route_transaction_operation}';`);

    result.forEach((record:any) => {
      for (let index = 0; index < record.rows.length; index++) {
        transactionsOperationDescriptions.push(record.rows.item(index));
      }
    });

    return transactionsOperationDescriptions;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}


export async function updateTransation(transactionOperation: IRouteTransaction) {
  try {
    const {
      id_route_transaction,
      date,
      state,
      id_work_day,
      id_store,
      id_payment_method,
    } = transactionOperation;

    const sqlite = await createSQLiteConnection();

    await sqlite.transaction(async (tx) => {
      try {
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
      } catch (error) {
        console.error('Something was wrong during "route transacion" instertion:', error);
      }
    });


  } catch(error) {
    /*
      TODO: Decide what to do in the case of failing the database creation.
    */
      console.error('Something was wrong during "route transacion" instertion:', error);
  }
}