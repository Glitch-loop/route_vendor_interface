import {
  ICurrency,
  IProductInventory,
  IStore,
  // IRouteDayStores,
  // IDayGeneralInformation,
  // IDay,
  // IRouteDay,
  // IRoute,
  // IDayOperation,
  IInventoryOperation,
  IInventoryOperationDescription,
  IStoreStatusDay,
  IPaymentMethod,
  IRouteTransaction,
  IRouteTransactionOperation,
  IProduct,
  IRouteTransactionOperationDescription,
  IDayGeneralInformation,
  IDay,
  IRouteDay,
  IRoute,
 } from '../interfaces/interfaces';


// Type guards
// Related to general information
export function isTypeICurrency(obj: any): obj is ICurrency {
  return 'id_denomination' in obj;
}

// Related to product inventory
export function isTypeIProductInventory(obj: any): obj is IProduct {
  return 'id_product' in obj;
}

export function isTypeIProduct(obj: any): obj is IProductInventory {
  return 'id_product' in obj  && 'amount' in obj;
}

// Related to store
export function isTypeIStore(obj: any): obj is IStore {
  return 'id_store' in obj;
}

export function isTypeIRouteStore(obj: any): obj is IStore&IStoreStatusDay {
  return 'id_store' in obj && 'route_day_state' in obj;
}

// Related to inventory operation
export function isTypeIInventoryOperation(obj: any): obj is IInventoryOperation {
  return 'id_inventory_operation' in obj;
}

export function isTypeIInventoryOperationDescription(obj: any):
obj is IInventoryOperationDescription {
  return 'id_product_operation_description' in obj;
}

// Related to transactions
export function isTypeIPaymentMethod(obj: any): obj is IPaymentMethod {
  return 'id_payment_method' in obj;
}

export function isTypeIRouteTransaction(obj: any): obj is IRouteTransaction {
  return 'id_route_transaction' in obj;
}

export function isTypeIRouteTransactionOperation(obj: any): obj is IRouteTransactionOperation {
  return 'id_route_transaction_operation' in obj;
}

export function isTypeIRouteTransactionOperationDescription(obj: any):
obj is IRouteTransactionOperationDescription {
  return 'id_route_transaction_operation_description' in obj;
}

// Intersection guards
// Related to work day
export function isTypeWorkDayInstersection(obj: any): obj is
IRoute&IDayGeneralInformation&IDay&IRouteDay {
  return 'id_route' in obj
  && 'id_route_day' in obj
  && 'day_name'     in obj
  && 'id_work_day' in obj;
}
