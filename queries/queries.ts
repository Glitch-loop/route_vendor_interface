import { supabase } from '../lib/supabase';
import TABLES from '../utils/tables';
import { IDay, IProduct, IRoute, IRouteDay, IRouteDayStores, IStore } from '../interfaces/interfaces';

export async function getAllDays ():Promise<IDay[]> {
  try {
    const { data, error } = await supabase.from(TABLES.DAYS).select();
    if (error) {
      return [];
    }
    return data;
  } catch (error) {
    return [];
  }
}

export async function getAllDaysByRoute (id_route:string):Promise<IRouteDay[]> {
  try {
    const { data, error } = await supabase.from(TABLES.ROUTE_DAYS).select().eq('id_route', id_route);
    if (error) {
      return [];
    }

    return data;
  } catch (error) {
    return [];
  }
}

export async function getAllRoutesByVendor (id_vendor:string):Promise<IRoute[]> {
  try {
    const { data, error } = await supabase.from(TABLES.ROUTES).select().eq('id_vendor', id_vendor);
    if (error) {
      return [];
    }
    return data;
  } catch (error) {
    return [];
  }
}

export async function getAllProducts():Promise<IProduct[]> {
  try {
    const { data, error } = await supabase.from(TABLES.PRODUCTS)
                                          .select()
                                          .order('order_to_show');
    if (error) {
      return [];
    } else {
      return data;
    }
  } catch (error) {
    return [];
  }
}

export async function getAllStoresInARouteDay(id_route_day:string):Promise<IRouteDayStores[]> {
  try {
    const { data, error } = await supabase.from(TABLES.ROUTE_DAY_STORES)
                                          .select()
                                          .eq('id_route_day', id_route_day)
                                          .order('position_in_route');
    if (error) {
      return [];
    } else {
      return data;
    }
  } catch (error) {
    return [];
  }
}

export async function getStoresByArrID(arr_id_stores: string[]):Promise<IStore[]> {
  try {
    const { data, error } = await supabase.from(TABLES.STORES)
                                  .select().in('id_store', arr_id_stores);

    if (error) {
      return [];
    } else {
      return data;
    }
  } catch (error) {
    return [];
  }
}
