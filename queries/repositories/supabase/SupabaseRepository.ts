import { IRepository } from '../interfaces/IRepository';
import { supabase } from '../../../lib/supabase';
import TABLES from '../../../utils/tables';
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

import 'react-native-url-polyfill/auto';
import { createApiResponse } from '../../../utils/apiResponse';

export class SupabaseRepository implements IRepository {
  client:any;

  constructor() {
    this.client = supabase;
  }

  // Related to the information of the stores
  async getAllDays(): Promise<IResponse<IDay[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.DAYS).select();

      if (error) {
        return createApiResponse<IDay[]>(500, [], null, 'Failed getting all the days.');
      } else {
        return createApiResponse<IDay[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IDay[]>(500, [], null, 'Failed getting all the days.');
    }
  }

  async getAllDaysByRoute(id_route:string):Promise<IResponse<IRouteDay[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.ROUTE_DAYS).select().eq('id_route', id_route);
      if (error) {
        return createApiResponse<IRouteDay[]>(500, [], null,
          'Failed getting all the days by route.');
      } else {
        return createApiResponse<IRouteDay[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IRouteDay[]>(500, [], null, 'Failed getting all the days by route.');
    }
  }

  async getAllRoutesByVendor(id_vendor:string):Promise<IResponse<IRoute[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.ROUTES).select().eq('id_vendor', id_vendor);
      if (error) {
        return createApiResponse<IRoute[]>(500, [], null,
          'Failed getting all routes by vendor.');
      } else {
        return createApiResponse<IRoute[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IRoute[]>(500, [], null, 'Failed getting all routes by vendor.');
    }
  }

  async getAllProducts():Promise<IResponse<IProduct[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.PRODUCTS)
                                            .select()
                                            .order('order_to_show');
      if (error) {
        return createApiResponse<IProduct[]>(500, [], null,
          'Failed getting all products.');
      } else {
        return createApiResponse<IProduct[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IProduct[]>(500, [], null, 'Failed getting all products.');
    }
  }

  async getAllStoresInARouteDay(id_route_day:string):Promise<IResponse<IRouteDayStores[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.ROUTE_DAY_STORES)
                                            .select()
                                            .eq('id_route_day', id_route_day)
                                            .order('position_in_route');
      if (error) {
        return createApiResponse<IRouteDayStores[]>(500, [], null,
          'Failed getting all stores in a route day.');
      } else {
        return createApiResponse<IRouteDayStores[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IRouteDayStores[]>(500, [], null, 'Failed getting all stores in a route day');
    }
  }

  async getStoresByArrID(arr_id_stores: string[]):Promise<IResponse<IStore[]>> {
    try {
      const { data, error } = await supabase.from(TABLES.STORES)
                                    .select().in('id_store', arr_id_stores);

      if (error) {
        return createApiResponse<IStore[]>(500, [], null,'Failed getting stores information.');
      } else {
        return createApiResponse<IStore[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IStore[]>(500, [], null, 'Failed getting stores information.');
    }
  }

  // Related to the work day information
  async insertWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<IResponse<void>> {
    try {
      const {
        id_work_day,
        start_date,
        finish_date,
        start_petty_cash,
        final_petty_cash,
        /*Fields related to IRoute interface*/
        id_route,
        // route_name,
        // description,
        // route_status,
        id_vendor,
        /*Fields related to IDay interface*/
        // id_day,
        // day_name,
        // order_to_show,
        /*Fields relate to IRouteDay*/
        // id_route_day,
      } = workday;

      const { data, error } = await supabase.from(TABLES.WORK_DAYS).insert({
        id_work_day: id_work_day,
        start_date: start_date,
        finish_date: finish_date,
        start_petty_cash: start_petty_cash,
        finish_petty_cash: final_petty_cash,
        id_route: id_route,
        id_vendor: id_vendor,
      });

      if (error) {
        return createApiResponse<void>(500, null, null,
          'Failed inserting the work day.');
      } else {
        return createApiResponse<void>(201, data, null, 'Work day created successfully.');
      }
    } catch(error) {
      return createApiResponse<void>(500, null, null, 'Failed inserting the work day.');
    }
  }

  async updateWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<IResponse<void>>{
    try {
      const {
        id_work_day,
        start_date,
        finish_date,
        start_petty_cash,
        final_petty_cash,
        /*Fields related to IRoute interface*/
        id_route,
        // route_name,
        // description,
        // route_status,
        id_vendor,
        /*Fields related to IDay interface*/
        // id_day,
        // day_name,
        // order_to_show,
        /*Fields relate to IRouteDay*/
        // id_route_day,
      } = workday;

      const { data, error } = await supabase.from(TABLES.WORK_DAYS)
      .update({
        start_date: start_date,
        finish_date: finish_date,
        start_petty_cash: start_petty_cash,
        finish_petty_cash: final_petty_cash,
        id_route: id_route,
        id_vendor: id_vendor,
      })
      .eq('id_work_day', id_work_day);

      if (error) {
        return createApiResponse<void>(500, null, null,'Failed updating the work day.');
      } else {
        return createApiResponse<void>(200, data, null, 'Work day updated successfully.');
      }
    } catch(error) {
      return createApiResponse<void>(500, null, null, 'Failed updating the work day.');
    }
  }

  // TODO: Related to users

  // Related to products (inventory operations)
  async insertInventoryOperation(inventoryOperation: IInventoryOperation):Promise<IResponse<void>> {
    try {
      const {
        id_inventory_operation,
        sign_confirmation,
        date,
        audit,
        id_type_of_operation,
        id_work_day,
      } = inventoryOperation;

      const { data, error } = await supabase.from(TABLES.INVENTORY_OPERATIONS)
      .insert({
        id_inventory_operation: id_inventory_operation,
        sign_confirmation: sign_confirmation,
        date: date,
        audit: audit,
        id_type_of_operation: id_type_of_operation,
        id_work_day: id_work_day,
      });

      if (error) {
        return createApiResponse<void>(500, null, null,'Failed inserting the inventory operation.');
      } else {
        return createApiResponse<void>(201, data, null, 'Inventory operation inserted successfully.');
      }
    } catch(error) {
      return createApiResponse<void>(500, null, null, 'Failed inserting the inventory operation.');
    }
  }

  async getAllInventoryOperationsOfWorkDay(workDay: IDayGeneralInformation):Promise<IResponse<IInventoryOperation[]>> {
    try {
      const { id_work_day } = workDay;
      const { data, error } = await supabase.from(TABLES.INVENTORY_OPERATIONS).select().eq('id_work_day', id_work_day);

      if (error) {
        return createApiResponse<IInventoryOperation[]>(500, [], null,
          'Failed getting all inventory operations of the day.');
      } else {
        return createApiResponse<IInventoryOperation[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IInventoryOperation[]>(500, [], null, 
        'Failed getting all inventory operations of the day.');
    }
  }

  async insertInventoryOperationDescription(inventoryOperationDescription: IInventoryOperationDescription[]):Promise<IResponse<void>> {
    try {
      inventoryOperationDescription
      .forEach(async (inventoryOperationItem:IInventoryOperationDescription)=> {
        const {
          id_product_operation_description,
          price_at_moment,
          amount,
          id_inventory_operation,
          id_product,
        } = inventoryOperationItem;

        const { data, error } = await supabase
        .from(TABLES.PRODUCT_OPERATION_DESCRIPTIONS)
        .insert({
          id_product_operation_description: id_product_operation_description,
          price_at_moment: price_at_moment,
          amount: amount,
          id_inventory_operation: id_inventory_operation,
          id_product: id_product,
        });

        if (error) {
          return createApiResponse<void>(500, null, null,
            'Failed inserting an operation description.');
        } else {
          /* There is not instruaciton; The process continues*/
        }
      });

      return createApiResponse<void>(201, null, null,
        'Inventory operation description inserted successfully.');

    } catch (error) {
      return createApiResponse<void>(500, null, null,
        'Failed inserting an operation description.');
    }
  }

  async getAllInventoryOperationDescriptionsOfInventoryOperation(inventoryOperation: IInventoryOperation):Promise<IResponse<IInventoryOperationDescription[]>> {
    try {
      const { id_inventory_operation } = inventoryOperation;
      const { data, error } = await supabase.from(TABLES.PRODUCT_OPERATION_DESCRIPTIONS).select().eq('id_inventory_operation', id_inventory_operation);
      if (error) {
        return createApiResponse<IInventoryOperationDescription[]>(500, [], null,
          'Failed getting all operation description of an inventory operation.');
      } else {
        return createApiResponse<IInventoryOperationDescription[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IInventoryOperationDescription[]>(500, [], null,
        'Failed getting all operation description of an inventory operation.');
    }
  }

  // Related to route transactions
  async insertRouteTransaction(transactionOperation: IRouteTransaction):Promise<IResponse<void>>{
    try {
      const {
        id_route_transaction,
        date,
        state,
        cash_received,
        id_work_day,
        id_store,
        id_payment_method,
      } = transactionOperation;

      const { data, error } = await supabase
      .from(TABLES.ROUTE_TRANSACTIONS)
      .insert({
        id_route_transaction: id_route_transaction,
        date: date,
        state: state,
        cash_received: cash_received,
        id_work_day: id_work_day,
        id_store: id_store,
        id_payment_method: id_payment_method,
      });
      if (error) {
        return createApiResponse<void>(500, null, null,'Failed inserting route transaction.');
      } else {
        return createApiResponse<void>(201, data, null, 'Route transaction inserted successfully.');
      }
    } catch(error) {
      return createApiResponse<void>(500, null, null, 'Failed inserting route transaction.');
    }
  }

  async getAllRouteTransactionsOfWorkDay(workDay: IDayGeneralInformation):
  Promise<IResponse<IRouteTransaction[]>>{
    try {
      const { id_work_day } = workDay;
      const { data, error } = await supabase.from(TABLES.ROUTE_TRANSACTIONS)
        .select().eq('id_work_day', id_work_day);

      if (error) {
        return createApiResponse<IRouteTransaction[]>(500, [], null,
          'Failed getting all route transactions of the day.');
      } else {
        return createApiResponse<IRouteTransaction[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IRouteTransaction[]>(500, [], null,
        'Failed getting all route transactions of the day.');
    }
  }

  async insertRouteTransactionOperation(transactionOperation: IRouteTransactionOperation):Promise<IResponse<void>>{
    try {
      const {
        id_route_transaction_operation,
        id_route_transaction,
        id_route_transaction_operation_type,
      } = transactionOperation;

      const { data, error } = await supabase
      .from(TABLES.ROUTE_TRANSACTION_OPERATIONS)
      .insert({
        id_route_transaction_operation: id_route_transaction_operation,
        id_route_transaction: id_route_transaction,
        id_route_transaction_operation_type: id_route_transaction_operation_type,
      });

      if (error) {
        return createApiResponse<void>(500, null, null,'Failed inserting route transaction route transaction operation.');
      } else {
        return createApiResponse<void>(201, data, null, 'Route transaction operation inserted successfully.');
      }
    } catch(error) {
      return createApiResponse<void>(500, null, null, 'Failed inserting route transaction route transaction operation.');
    }
  }

  async getAllRouteTransactionOperationsOfRouteTransaction(routeTransaction: IRouteTransaction):Promise<IResponse<IRouteTransactionOperation[]>>{
    try {
      const { id_route_transaction } = routeTransaction;
      const { data, error } = await supabase.from(TABLES.ROUTE_TRANSACTION_OPERATIONS).select()
        .eq('id_route_transaction', id_route_transaction);
      if (error) {
        return createApiResponse<IRouteTransactionOperation[]>(500, [], null,
          'Failed getting all route transactions operation of a route transaction.');
      } else {
        return createApiResponse<IRouteTransactionOperation[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IRouteTransactionOperation[]>(500, [], null,
        'Failed getting all route transactions operation of a route transaction.');
    }
  }

  async insertRouteTransactionOperationDescription(transactionOperationDescription: IRouteTransactionOperationDescription[]):Promise<IResponse<void>> {
    try {
      transactionOperationDescription.forEach(async (transactionDescription:IRouteTransactionOperationDescription)=> {
        try {
          const {
            id_route_transaction_operation_description,
            price_at_moment,
            amount,
            id_route_transaction_operation,
            id_product,
          } = transactionDescription;

          const { data, error } = await supabase
          .from(TABLES.ROUTE_TRANSACTION_OPERATIONS_DESCRIPTONS)
          .insert({
            id_route_transaction_operation_description:  id_route_transaction_operation_description,
            price_at_moment: price_at_moment,
            amount: amount,
            id_route_transaction_operation: id_route_transaction_operation,
            id_product: id_product,
          });

          if (error) {
            return createApiResponse<void>(500, null, null,
              'Failed inserting route transaction operation description.');
          } else {
            /* There is not instructions*/
          }
        } catch (error) {
          return createApiResponse<void>(500, null, null,
            'Failed inserting route transaction operation description.');
        }
      });

      return createApiResponse<void>(201, null, null, 'Route transaction operation description inserted successfully.');
    } catch(error) {
      return createApiResponse<void>(500, null, null,
        'Failed inserting route transaction operation description.');
    }
  }

  async getAllRouteTransactionOperationsDescriptionOfRouteTransactionOperation(routeTransactionOperation:IRouteTransactionOperation):Promise<IResponse<IRouteTransactionOperationDescription[]>> {
    try {
      const { id_route_transaction_operation } = routeTransactionOperation;
      const { data, error } = await supabase.from(TABLES.PRODUCT_OPERATION_DESCRIPTIONS).select()
        .eq('id_route_transaction_operation', id_route_transaction_operation);
      if (error) {
        return createApiResponse<IRouteTransactionOperationDescription[]>(500, [], null,
          'Failed getting all route transactions operation description of a route transaction operation.');
      } else {
        return createApiResponse<IRouteTransactionOperationDescription[]>(200, data, null);
      }
    } catch(error) {
      return createApiResponse<IRouteTransactionOperationDescription[]>(500, [], null,
        'Failed getting all route transactions operation description of a route transaction operation.');
    }
  }

  async updateTransaction(routeTransaction: IRouteTransaction):Promise<IResponse<void>> {
    try {
      const {
        id_route_transaction,
        date,
        state,
        id_work_day,
        id_store,
        id_payment_method,
      } = routeTransaction;

      const { data, error } = await supabase.from(TABLES.ROUTE_TRANSACTIONS)
      .update({
        date: date,
        state: state,
        id_work_day: id_work_day,
        id_store: id_store,
        id_payment_method: id_payment_method,
      })
      .eq('id_work_day', id_route_transaction);
      
      if (error) {
        return createApiResponse<void>(500, null, null,'Failed updating route transaction.');
      } else {
        return createApiResponse<void>(2000, null, null, 'Route transaction updated successfully.');
      }
    } catch(error) {
      return createApiResponse<void>(500, null, null, 'Failed updating route transaction.');
    }
  }
}