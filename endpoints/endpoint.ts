import { supabase } from "../lib/supabase";
import TABLES from "../utils/tables";
import { IDay, IProduct, IRoute, IRouteDays } from "../interfaces/interfaces";

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

export async function getAllDaysByRoute (id_route:number):Promise<IRouteDays[]> {
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

export async function getAllRoutesByVendor (id_vendor:number):Promise<IRoute[]> {
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
    const { data, error } = await supabase.from(TABLES.PRODUCTS).select();
    if (error) {
      return [];
    }
    return data;
  } catch (error) {
    return [];
  }
}
