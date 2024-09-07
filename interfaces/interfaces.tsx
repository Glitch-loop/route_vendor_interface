
export interface IDay {
  id_day: number;
  day_name: string;
}

export interface IProduct {
  id_product: number;
  product_name: string;
  barcode?: string;
  weight?: string;
  unit?: string;
  comission: number;
  price: number
  product_status: number;
}

export interface IProductInventory
extends IProduct {
  amount: number;
}

export interface IRoute {
  id_route: number;
  route_name: string;
  description?: string;
  route_status: string;
  id_vendor: number;
}

export interface IStore {
  id_store: number;
  street: string;
  ext_number: string;
  colony: string;
  postal_code: string;
  address_reference?: string;
  store_name?: string;
  owner_name?: string;
  cellphone?: string;
  latitude: string;
  longuitude: string;
  id_creator: number;
  creation_date: string;
  creation_context: string;
  status_store: string;
}

export interface IRouteDay {
  id_route_number: number;
  position_in_route: number;
  id_route: number;
  id_day: number;
}


export interface IUser {
  id_vendor: number;
  cellphone?: string;
  name: string;
  password?: string;
  status?: number;
}
