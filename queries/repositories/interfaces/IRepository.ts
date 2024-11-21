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
  IResponse,
} from '../../../interfaces/interfaces';

export interface IRepository {
  // Related to the information of the stores
  getAllDays(): Promise<IResponse<IDay[]>>;
  getAllDaysByRoute(id_route:string): Promise<IResponse<IRouteDay[]>>;
  getAllRoutesByVendor(id_vendor:string): Promise<IResponse<IRoute[]>>;
  getAllProducts(): Promise<IResponse<IProduct[]>>;
  getAllStoresInARouteDay(id_route_day:string): Promise<IResponse<IRouteDayStores[]>>;
  getStoresByArrID(arr_id_stores: string[]): Promise<IResponse<IStore[]>>;

  // Related to the work day information
  insertWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<IResponse<void>>;
  updateWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<IResponse<void>>;

  // TODO: Related to users

  // Related to products (inventory operations)
  insertInventoryOperation(inventoryOperation: IInventoryOperation):Promise<IResponse<void>>;
  getAllInventoryOperationsOfWorkDay(workDay: IDayGeneralInformation):Promise<IResponse<IInventoryOperation[]>>;
  insertInventoryOperationDescription(inventoryOperationDescription: IInventoryOperationDescription[]):Promise<IResponse<void>>;
  getAllInventoryOperationDescriptionsOfInventoryOperation(inventoryOperation: IInventoryOperation):Promise<IResponse<IInventoryOperationDescription[]>>;

  // Related to route transactions
  insertRouteTransaction(transactionOperation: IRouteTransaction):Promise<IResponse<void>>;
  getAllRouteTransactionsOfWorkDay(workDay: IDayGeneralInformation):Promise<IResponse<IRouteTransaction[]>>;
  insertRouteTransactionOperation(transactionOperation: IRouteTransactionOperation):Promise<IResponse<void>>;
  getAllRouteTransactionOperationsOfRouteTransaction(routeTransaction: IRouteTransaction):Promise<IResponse<IRouteTransactionOperation[]>>;
  insertRouteTransactionOperationDescription(transactionOperationDescription: IRouteTransactionOperationDescription[]):Promise<IResponse<void>>;
  getAllRouteTransactionOperationsDescriptionOfRouteTransactionOperation(routeTransactionOperation:IRouteTransactionOperation):Promise<IResponse<IRouteTransactionOperationDescription[]>>;
  updateTransaction(transactionOperation: IRouteTransaction):Promise<IResponse<void>>;
}
