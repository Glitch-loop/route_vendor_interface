import {
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
  IProduct,
  IRouteDayStores,
} from '../../../interfaces/interfaces';

export interface IRepository {
  // Related to the information of the stores
  getAllDays(): Promise<IDay[]>;
  getAllDaysByRoute(id_route:string): Promise<IRouteDay[]>;
  getAllRoutesByVendor(id_vendor:string): Promise<IRoute[]>;
  getAllProducts(): Promise<IProduct[]>;
  getAllStoresInARouteDay(id_route_day:string): Promise<IRouteDayStores[]>;
  getStoresByArrID(arr_id_stores: string[]): Promise<IStore[]>;

  // Related to the work day information
  insertWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<void>;
  updateWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<void>;

  // TODO: Related to users

  // Related to products (inventory operations)
  insertInventoryOperation(inventoryOperation: IInventoryOperation):Promise<void>;
  getAllInventoryOperation():Promise<IInventoryOperation[]>;
  insertInventoryOperationDescription(inventoryOperationDescription: IInventoryOperationDescription[]):Promise<void>;
  getAllInventoryOperationDescription():Promise<IInventoryOperationDescription[]>;

  // Related to route transactions
  insertRouteTransaction(transactionOperation: IRouteTransaction):Promise<void>;
  getAllRouteTransaction():Promise<IRouteTransaction[]>;
  insertRouteTransactionOperation(transactionOperation: IRouteTransactionOperation):Promise<void>;
  getAllRouteTransactionOperation():Promise<IRouteTransactionOperation[]>;
  insertRouteTransactionOperationDescription(transactionOperationDescription: IRouteTransactionOperationDescription[]):Promise<void>;
  getAllRouteTransactionOperationDescription():Promise<IRouteTransactionOperation[]>;
  updateTransaction(transactionOperation: IRouteTransaction):Promise<void>;
}
