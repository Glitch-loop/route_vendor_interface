// Embedded database
import {
  insertDayOperations,
  insertProducts,
  insertStores,
  insertWorkDay,
  insertDayOperation,
  insertInventoryOperation,
  insertInventoryOperationDescription,
  getInventoryOperation,
  getInventoryOperationDescription,
  getProducts,
  getAllInventoryOperations,
  getRouteTransactionByStore,
  getRouteTransactionOperations,
  getRouteTransactionOperationDescriptions,
  updateProducts,
  updateWorkDay,
  deleteAllDayOperations,
  deleteAllWorkDayInformation,
  deleteAllProducts,
  deleteAllStores,
  deleteAllInventoryOperations,
  deleteAllInventoryOperationsDescriptions,
  deleteAllRouteTransactions,
  deleteAllRouteTransactionOperations,
  deleteAllRouteTransactionOperationDescriptions,
  deleteInventoryOperationDescriptionsById,
  deleteInventoryOperationsById,
  insertSyncQueueRecord,
  insertSyncQueueRecords,
  deleteSyncQueueRecord,
  deleteSyncQueueRecords,

} from '../queries/SQLite/sqlLiteQueries';

export async function cleanAllRouteTransactionsFromDatabase() {
  // Deleting all route transactions.
  await deleteAllRouteTransactionOperationDescriptions();
  await deleteAllRouteTransactionOperations();
  await deleteAllRouteTransactions();
}