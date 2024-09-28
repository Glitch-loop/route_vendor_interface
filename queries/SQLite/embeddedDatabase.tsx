/*
  This document contains the database that the system uses to
  store temporarily the information before of storing in the
  central database.

  Thanks to this database is that the system can operate offline
  and in general without the necesity of a special connection
  with the whole system.

  The intention of this database is to be as more straingforward
  as possible to make easier the usage of the information by
  the system, so having this, it is possible that the database
  doesn't reach high levels of normalization.
*/

export const userEmbeddedTable = `
  CREATE TABLE IF NOT EXISTS user (
    id_vendor TEXT NOT NULL UNIQUE, 
    cellphone TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL UNIQUE
  );
`;

export const routeDayEmbeddedTable = `
  CREATE TABLE IF NOT EXISTS route_day (
    id_work_day TEXT NOT NULL UNIQUE, 
    start_date TEXT UNIQUE NOT NULL,
    end_date TEXT UNIQUE,
    start_petty_cash NUMERIC(6,3) NOT NULL UNIQUE,
    end_petty_cash NUMERIC(6,3),
    id_route TEXT NOT NULL UNIQUE,
    route_name TEXT NOT NULL UNIQUE,
    description TEXT,
    route_status TEXT NOT NULL UNIQUE,
    id_day TEXT NOT NULL UNIQUE,
    id_route_day TEXT NOT NULL UNIQUE
  );
`;

export const storesEmbeddedTable = `
  CREATE TABLE IF NOT EXISTS stores (
    id_store TEXT NOT NULL UNIQUE,
    street TEXT NOT NULL,
    ext_number TEXT NOT NULL,
    colony TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    address_reference TEXT NOT NULL,
    store_name TEXT NOT NULL,
    owner_name TEXT,
    cellphone TEXT,
    latitude TEXT,
    longuitude TEXT,
    id_creator TEXT,
    creation_date TEXT,
    creation_context TEXT,
    status_store INT,
    route_day_state INT
  );
`;

export const productsEmbeddedTable = `
  CREATE TABLE IF NOT EXISTS products (
    id_product      TEXT NOT NULL UNIQUE,
    product_name    TEXT NOT NULL,
    weight          TEXT,
    unit            TEXT,
    comission       NUMERIC(6,3),
    price           NUMERIC(6,3) NOT NULL,
    product_status  INT NOT NULL,
    order_to_show   INT NOT NULL UNIQUE,
    amount          INT NOT NULL UNIQUE
  );
`;

export const dayOperationsEmbeddedTable = `
  CREATE TABLE IF NOT EXISTS day_operations (
    id_day_operation  TEXT NOT NULL UNIQUE,
    id_item           TEXT NOT NULL,
    id_type_operation TEXT NOT NULL,
    operation_order   INT NOT NULL,
    current_operation INT NOT NULL
  );
`;

export const routeTransactionsEmbeddedTable = `
  CREATE TABLE IF NOT EXISTS route_transactions (
    id_transaction TEXT NOT NULL UNIQUE,
    date           DATETIME NOT NULL,
    state INT NOT NULL,
    id_work_day TEXT NOT NULL,
    id_store TEXT NOT NULL,
    id_type_operation TEXT NOT NULL
  );
`;

export const transactionDescriptionsEmbeddedTable = `
  CREATE TABLE IF NOT EXISTS transaction_descriptions (
    id_transaction_description TEXT NOT NULL,
    price_at_moment NUMERIC(6,3) NOT NULL,
    amount INT NOT NULL,
    id_route_transaction TEXT NOT NULL UNIQUE,
    id_product TEXT NOT NULL UNIQUE
  )
`;

export const inventoryOperationsEmbeddedTable = `
CREATE TABLE IF NOT EXISTS inventory_operations (
  id_inventory_operation TEXT NOT NULL UNIQUE, 
  sign_confirmation TEXT NOT NULL,
  date DATETIME NOT NULL,
  audit INT NOT NULL,
  id_type_of_operation TEXT NOT NULL,
  id_work_day TEXT NOT NULL
);
`;

export const productOperationDescriptionsEmbeddedTable = `
  CREATE TABLE IF NOT EXISTS produc_operation_descriptions (
    id_product_operation_description TEXT NOT NULL,
    price_at_moment NUMERIC(6,3) NOT NULL,
    amount INT NOT NULL
    id_inventory_operation TEXT NOT NULL,
    id_product TEXT NOT NULL
  );   
`;