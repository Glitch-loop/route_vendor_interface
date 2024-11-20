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
} from '../../../interfaces/interfaces';

import 'react-native-url-polyfill/auto';

export class SupabaseRepository implements IRepository {
  client:any;

  constructor() {
    this.client = supabase;
  }

  // Related to the information of the stores
  async getAllDays(): Promise<IDay[]> {
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

  async getAllDaysByRoute(id_route:string):Promise<IRouteDay[]> {
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

  async getAllRoutesByVendor(id_vendor:string):Promise<IRoute[]> {
    try {
      const { data, error } = await supabase.from(TABLES.ROUTES).select().eq('id_vendor', id_vendor);
      if (error) {
        return [];
      }
      return data;
    } catch (error) {
      console.log(error)
      return [];
    }
  }

  async getAllProducts():Promise<IProduct[]> {
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

  async getAllStoresInARouteDay(id_route_day:string):Promise<IRouteDayStores[]> {
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

  async getStoresByArrID(arr_id_stores: string[]):Promise<IStore[]> {
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

  // Related to the work day information
  async insertWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<void> {
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

    } catch (error) {
      console.error('Failed to insert work day:', error);
    }
  }

  async updateWorkDay(workday:IRoute&IDayGeneralInformation&IDay&IRouteDay):Promise<void>{
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

    } catch (error) {
      console.error('Failed to update work day:', error);
    }
  }

  // TODO: Related to users

  // Related to products (inventory operations)
  async insertInventoryOperation(inventoryOperation: IInventoryOperation):Promise<void> {
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

    } catch (error) {
      console.error('Failed to insert inventory operation: ', error);
    }
  }

  async getAllInventoryOperationsOfWorkDay(workDay: IDayGeneralInformation):Promise<IInventoryOperation[]> {
    try {
      const { id_work_day } = workDay;
      const { data, error } = await supabase.from(TABLES.INVENTORY_OPERATIONS).select().eq('id_work_day', id_work_day);
      if (error) {
        return [];
      } else {
        return data;
      }
    } catch (error) {
      return [];
    }
  }

  async insertInventoryOperationDescription(inventoryOperationDescription: IInventoryOperationDescription[]):Promise<void> {
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
      });
    } catch (error) {
      console.error('Failed to insert inventory operation description: ', error);
    }
  }

  async getAllInventoryOperationDescriptionsOfInventoryOperation(inventoryOperation: IInventoryOperation):Promise<IInventoryOperationDescription[]> {
    try {
      const { id_inventory_operation } = inventoryOperation;
      const { data, error } = await supabase.from(TABLES.PRODUCT_OPERATION_DESCRIPTIONS).select().eq('id_inventory_operation', id_inventory_operation);
      if (error) {
        return [];
      } else {
        return data;
      }
    } catch (error) {
      return [];
    }
  }

  // Related to route transactions
  async insertRouteTransaction(transactionOperation: IRouteTransaction):Promise<void>{
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
    } catch(error) {
      /*
        TODO: Decide what to do in the case of failing the database creation.
      */
        console.error('Something was wrong during "route transacion" instertion:', error);
    }
  }

  async getAllRouteTransactionsOfWorkDay(workDay: IDayGeneralInformation):Promise<IRouteTransaction[]>{
    try {
      const { id_work_day } = workDay;
      const { data, error } = await supabase.from(TABLES.ROUTE_TRANSACTIONS).select().eq('id_work_day', id_work_day);
      if (error) {
        return [];
      } else {
        return data;
      }
    } catch (error) {
      return [];
    }
  }

  async insertRouteTransactionOperation(transactionOperation: IRouteTransactionOperation):Promise<void>{
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

    } catch(error) {
      /*
        TODO: Decide what to do in the case of failing the database creation.
      */
      console.error('Something was wrong during "route transacion operation" instertion:', error);
    }
  }

  async getAllRouteTransactionOperationsOfRouteTransaction(routeTransaction: IRouteTransaction):Promise<IRouteTransactionOperation[]>{
    try {
      const { id_route_transaction } = routeTransaction;
      const { data, error } = await supabase.from(TABLES.ROUTE_TRANSACTION_OPERATIONS).select()
        .eq('id_route_transaction', id_route_transaction);
      if (error) {
        return [];
      } else {
        return data;
      }
    } catch (error) {
      return [];
    }
  }

  async insertRouteTransactionOperationDescription(transactionOperationDescription: IRouteTransactionOperationDescription[]):Promise<void> {
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

        } catch (error) {
          console.error('Something was wrong during "route transacion operation description" instertion:', error);
        }
      });

    } catch(error) {
      /*
        TODO: Decide what to do in the case of failing the database creation.
      */
        console.error('Something was wrong during "route transacion operation description" instertion:', error);
    }
  }

  async getAllRouteTransactionOperationsDescriptionOfRouteTransactionOperation(routeTransactionOperation:IRouteTransactionOperation):Promise<IRouteTransactionOperationDescription[]> {
    try {
      const { id_route_transaction_operation } = routeTransactionOperation;
      const { data, error } = await supabase.from(TABLES.PRODUCT_OPERATION_DESCRIPTIONS).select()
        .eq('id_route_transaction_operation', id_route_transaction_operation);
      if (error) {
        return [];
      } else {
        return data;
      }
    } catch (error) {
      return [];
    }
  }

  async updateTransaction(routeTransaction: IRouteTransaction):Promise<void> {
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
    } catch(error) {
      /*
        TODO: Decide what to do in the case of failing the database creation.
      */
        console.error('Something was wrong during "route transacion" instertion:', error);
    }
  }
}
