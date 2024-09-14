
export interface IDay {
  id_day: string;
  day_name?: string;
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

export interface IProductInventory
extends IProduct {
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
  new_client: boolean;
  special_sale: boolean;
  visited: boolean;
  petition_to_visit: boolean;
}
