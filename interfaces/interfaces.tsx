
export interface IDay {
  id_day: string;
  day_name: string;
  order_to_show: number;
}

export interface IProduct {
  id_product: string;
  product_name: string;
  barcode?: string;
  weight?: string;
  unit?: string;
  comission: number;
  price: number
  product_status: number;
  order_to_show: number;
}

export interface IProductInventory extends IProduct {
  amount: number;
}

export interface IStore {
  id_store: string;
  street: string;
  ext_number: string;
  colony: string;
  postal_code: string;
  address_reference?: string;
  store_name: string;
  owner_name?: string;
  cellphone?: string;
  latitude: string;
  longuitude: string;
  id_creator: number;
  creation_date: string;
  creation_context: string;
  status_store: string;
}

export interface ICoordinates {
  latitude: number;
  longitude: number;
}

export interface IUser {
  id_vendor: string;
  cellphone?: string;
  name: string;
  password?: string;
  status?: number;
}

export interface ICurrency {
  id_denomination: number;
  value: number;
  amount?: number; // Field to describe the amount of that currency they currently have.
  coin?: boolean;
}

export interface IDayGeneralInformation {
  id_work_day: string;
  start_date: string;
  finish_date: string;
  start_petty_cash: number;
  final_petty_cash: number;
}

export interface IRouteDayStores {
  id_route_day_store: string;
  position_in_route: number;
  id_route_day: string;
  id_store: string;
}

export interface IRoute {
  id_route: string;
  route_name: string;
  description?: string;
  route_status: string;
  id_vendor: string;
}

export interface IRouteDay {
  id_route_day: string;
  id_route:string;
  id_day: string;
}

export interface ICompleteRouteDay extends IRouteDay {
  day: IDay;
}

export interface ICompleteRoute extends IRoute {
  routeDays: ICompleteRouteDay[];
}

export interface IDayOperation {
  id_day_operation: string;
  id_item: string;
  id_type_operation: string;
  operation_order: number;
  current_operation: number;
}

export interface IStoreStatusDay {
  route_day_state: number;
}

// Related to inventory operation
export interface IInventoryOperation {
  id_inventory_operation: string;
  sign_confirmation: string;
  date: string;
  state: number;
  audit: number;
  id_type_of_operation: string;
  id_work_day: string;
}

export interface IInventoryOperationDescription {
  id_product_operation_description: string;
  price_at_moment: number;
  amount: number;
  id_inventory_operation: string;
  id_product: string;
}

// Related to transactions
export interface IPaymentMethod {
  id_payment_method: string;
  payment_method_name: string;
}

export interface IRouteTransaction {
  id_route_transaction: string;
  date: string;
  state: number;
  cash_received: number;
  id_work_day: string;
  id_payment_method: string;
  id_store: string;
}

export interface IRouteTransactionOperation {
  id_route_transaction_operation:       string;
  id_route_transaction:                 string;
  id_route_transaction_operation_type:  string;
}

export interface IRouteTransactionOperationDescription {
  id_route_transaction_operation_description: string;
  price_at_moment:                            number;
  amount:                                     number;
  id_route_transaction_operation:             string;
  id_product:                                 string;
}

// Responses
export interface IResponse<T> {
  responseCode: number;
  data:         T;
  message?:     string;
  error?:       string;
}


// Related to syncing process
export interface ISyncRecord {
  id_record:  string,
  status:     'PENDING'|'SUCCESS'|'FAILED',
  payload:    any,
  table_name:      string,
  action:     'INSERT'|'UPDATE'|'DELETE',
}
