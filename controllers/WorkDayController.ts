// Embedded database
import {
  insertWorkDay,
  deleteAllWorkDayInformation,
  deleteSyncQueueRecord,
  updateWorkDay,
} from '../queries/SQLite/sqlLiteQueries';

// Interfaces
import {
  ICurrency,
  IDayGeneralInformation,
  IDay,
  IRouteDay,
  IRoute,
  IResponse,
  ISyncRecord,
 } from '../interfaces/interfaces';

// Utils
import { timestamp_format } from '../utils/momentFormat';
import {
  apiResponseStatus,
  getDataFromApiResponse,
} from '../utils/apiResponse';
import Toast from 'react-native-toast-message';

import { createRecordForSyncingWithCentralDatabse, deleteRecordForSyncingWithCentralDatabase } from '../services/syncService';
import { generateUUIDv4 } from '../utils/generalFunctions';


export function createWorkDayConcept(cashInventory:ICurrency[],
  routeDay:IRoute&IDayGeneralInformation&IDay&IRouteDay):IRoute&IDayGeneralInformation&IDay&IRouteDay {
  const workDay:IRoute&IDayGeneralInformation&IDay&IRouteDay = {
    /*Fields related to the general information.*/
    id_work_day: '',
    start_date: '',
    finish_date: '',
    start_petty_cash: 0,
    final_petty_cash: 0,
    /*Fields related to IRoute interface*/
    id_route: '',
    route_name: '',
    description: '',
    route_status: '',
    id_vendor: '',
    /*Fields related to IDay interface*/
    id_day: '',
    day_name: '',
    order_to_show: 0,
    /*Fields relate to IRouteDay*/
    id_route_day: '',
  };

  try {
    const updatedRouteDay:IRoute&IDayGeneralInformation&IDay&IRouteDay = { ...routeDay };

    let startPettyCash:number = cashInventory.reduce((acc, currentCurrency) =>
      { if (currentCurrency.amount === undefined) {return acc;} else {return acc + currentCurrency.amount * currentCurrency.value;}}, 0);

    // General information about the route.
    updatedRouteDay.id_work_day = generateUUIDv4();
    updatedRouteDay.start_date = timestamp_format();
    updatedRouteDay.finish_date = timestamp_format();
    updatedRouteDay.start_petty_cash = startPettyCash;
    updatedRouteDay.final_petty_cash =  0;

    // Concatenating all the information.
    return updatedRouteDay;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Error durante la creación del nuevo dia de trabajo.',
      text2: 'Ha habido un error durante la creación del dia de trabajo, por favor intente nuevamente.',
    });
    return workDay;
  }
}

export function finishWorkDayConcept(cashInventory:ICurrency[],
  routeDay:IRoute&IDayGeneralInformation&IDay&IRouteDay):IRoute&IDayGeneralInformation&IDay&IRouteDay {
  try {
    const updatedRouteDay:IRoute&IDayGeneralInformation&IDay&IRouteDay = { ...routeDay };

    let endPettyCash:number = cashInventory.reduce((acc, currentCurrency) =>
      { if (currentCurrency.amount === undefined) {return acc;} else {return acc + currentCurrency.amount * currentCurrency.value;}}, 0);

    // General information about the route.
    /* Since it is the end shift of the route, there are information that we already have from other operations */
    updatedRouteDay.finish_date = timestamp_format();
    updatedRouteDay.final_petty_cash = endPettyCash;

    return updatedRouteDay;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Error durante cierre del dia de trabajo.',
      text2: 'Ha habido error durante la finalización del "dia de trabajo", intente nuevamente.',
    });
    return routeDay;
  }
}

export async function createWorkDay(
  cashInventory:ICurrency[],
  routeDay:IRoute&IDayGeneralInformation&IDay&IRouteDay,
) {
  const dayGeneralInformation:IRoute&IDayGeneralInformation&IDay&IRouteDay
    = createWorkDayConcept(cashInventory, routeDay);

  const resultInsertionWorkDay:IResponse<IRoute&IDayGeneralInformation&IDay&IRouteDay>
    = await insertWorkDay(dayGeneralInformation);


  const resultCreateRecordToSync:IResponse<any> =
    await createRecordForSyncingWithCentralDatabse(dayGeneralInformation, 'PENDING', 'INSERT');

  if (apiResponseStatus(resultInsertionWorkDay, 201)
  && apiResponseStatus(resultCreateRecordToSync, 201)) {
    /* There is not instruction */
  } else {
    const recordToSync:ISyncRecord = getDataFromApiResponse(resultCreateRecordToSync);

    await deleteAllWorkDayInformation();
    await deleteSyncQueueRecord(recordToSync);

    resultInsertionWorkDay.responseCode = 400;
  }

  return resultInsertionWorkDay;
}

export async function finishWorkDay(
  cashInventory:ICurrency[],
  generalInformationOfRouteDay:IRoute&IDayGeneralInformation&IDay&IRouteDay,
) {
  const dayGeneralInformation:IRoute&IDayGeneralInformation&IDay&IRouteDay
    = finishWorkDayConcept(cashInventory, generalInformationOfRouteDay);

  const resultFinishingWorkDay:IResponse<IRoute&IDayGeneralInformation&IDay&IRouteDay>
    = await updateWorkDay(dayGeneralInformation);

  const resultCreateRecordToSync:IResponse<any> = await createRecordForSyncingWithCentralDatabse(
    dayGeneralInformation,
    'PENDING',
    'UPDATE'
  );

  if (apiResponseStatus(resultFinishingWorkDay, 200)
    && apiResponseStatus(resultCreateRecordToSync, 201)) {
      /* There is not instruction */
    } else {
      const recordToSync:ISyncRecord = getDataFromApiResponse(resultCreateRecordToSync);

      await deleteAllWorkDayInformation();
      await deleteSyncQueueRecord(recordToSync);

      resultFinishingWorkDay.responseCode = 400;
    }

    return resultFinishingWorkDay;

}

export async function setWorkDay(
  cashInventory:ICurrency[],
  generalInformationOfRouteDay:IRoute&IDayGeneralInformation&IDay&IRouteDay,
) {
  const dayGeneralInformation:IRoute&IDayGeneralInformation&IDay&IRouteDay
    = finishWorkDayConcept(cashInventory, generalInformationOfRouteDay);

  const resultFinishingWorkDay:IResponse<IRoute&IDayGeneralInformation&IDay&IRouteDay>
    = await updateWorkDay(dayGeneralInformation);

  const resultCreateRecordToSync:IResponse<any> = await createRecordForSyncingWithCentralDatabse(
    dayGeneralInformation,
    'PENDING',
    'UPDATE'
  );

  if (apiResponseStatus(resultFinishingWorkDay, 200)
    && apiResponseStatus(resultCreateRecordToSync, 201)) {
      /* There is not instruction */
    } else {
      const recordToSync:ISyncRecord = getDataFromApiResponse(resultCreateRecordToSync);

      await deleteAllWorkDayInformation();
      await deleteSyncQueueRecord(recordToSync);

      resultFinishingWorkDay.responseCode = 400;
    }

    return resultFinishingWorkDay;

}

export async function cleanWorkdayFromDatabase() {
  return await deleteAllWorkDayInformation();
}

export async function cancelWorkDayUpdate(
  generalInformationOfRouteDay:IRoute&IDayGeneralInformation&IDay&IRouteDay
) {
  const resultFinishingWorkDay:IResponse<IRoute&IDayGeneralInformation&IDay&IRouteDay>
  = await updateWorkDay(generalInformationOfRouteDay);

  /*
    Since the function is cancelling a work day update, the record for sync has: 'pending' and 'update'
  */
  const resultCreateRecordToSync:IResponse<any> = await deleteRecordForSyncingWithCentralDatabase(
    generalInformationOfRouteDay,
    'PENDING',
    'UPDATE'
  );

  if(apiResponseStatus(resultFinishingWorkDay, 201)
  && apiResponseStatus(resultCreateRecordToSync, 201)) {
    /* There is no instructions */
  } else {

    /* Try again */
    await updateWorkDay(generalInformationOfRouteDay);
    await deleteRecordForSyncingWithCentralDatabase(
      generalInformationOfRouteDay,
      'PENDING',
      'UPDATE'
    );
  }

}
