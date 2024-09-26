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
  CREATE TABLE IF NOT EXISTS 
`;

export const routeDayEmbeddedTable = `
`;

export const storesEmbeddedTable = `
`;

export const productsEmbeddedTable = `
`;

export const dayOperationsEmbeddedTable = `
`;

export const routeTransactionsEmbeddedTable = `
`;

export const transactionDescriptionsEmbeddedTable = `
`;

export const inventoryOperationsEmbeddedTable = `
`;

export const productOperationDescriptionsEmbeddedTable = `
`;
