// Queries
// Main database
import { RepositoryFactory } from '../queries/repositories/RepositoryFactory';

// Embedded database
import {
  insertStores,
  deleteAllStores,
} from '../queries/SQLite/sqlLiteQueries';

// Interfaces
import {
  IRouteDayStores,
  IStore,
  IDayGeneralInformation,
  IDay,
  IRouteDay,
  IRoute,
  IStoreStatusDay,
  IResponse,
 } from '../interfaces/interfaces';

// Utils
import { determineRouteDayState } from '../utils/routeDayStoreStatesAutomata';
import { enumStoreStates } from '../interfaces/enumStoreStates';
import {
  apiResponseStatus,
  getDataFromApiResponse,
} from '../utils/apiResponse';

// Initializing database repository.
let repository = RepositoryFactory.createRepository('supabase');

// Related to process the information from getters
/*
  Function to get the stores that belongs to the current day in the route.
*/
export async function getStoresOfRouteDay(routeDay:IRouteDay):Promise<IResponse<IRouteDayStores[]>> {
  /*
    Getting the particular stores that belongs to the route day.
    In addition, this query provides the position of each store in the day.
  */
  let resultAllStoresInRoute:IResponse<IRouteDayStores[]> = {
    responseCode: 500,
    data: [],
  };
  const storesInTheRoute:IRouteDayStores[] = [];

  resultAllStoresInRoute = await repository.getAllStoresInARouteDay(routeDay.id_route_day);

  let allStoreInRoute:IRouteDayStores[] = getDataFromApiResponse(resultAllStoresInRoute);

  allStoreInRoute.forEach((storeInRouteDay) => { storesInTheRoute.push(storeInRouteDay); });

  resultAllStoresInRoute.data = storesInTheRoute;


  return resultAllStoresInRoute;
}

/*
  Function that sets the information needed for the route day.
*/
async function getStoresInformation(
  storesInRoute:IRouteDayStores[]
):Promise<IResponse<(IStore&IStoreStatusDay)[]>> {
  let resultGetStores:IResponse<any> = {
    responseCode: 500,
    data: [],
  };
  const stores:(IStore&IStoreStatusDay)[] = [];
  let storesInformation:IStore[] = [];
  const idStoresArr:string[] = [];

  /*
    In addition of the information of the stores, it is determined the "state" for each store during the route.

    The state is a way to determine the status of a store in route (if it is pending to visit, if it has been visited,
    if it is a new client, etc).
  */
  for (let i = 0; i < storesInRoute.length; i++) {
    const { id_store } = storesInRoute[i];
    idStoresArr.push(id_store);
  }

  resultGetStores = await repository.getStoresByArrID(idStoresArr);

  storesInformation = getDataFromApiResponse(resultGetStores);

  // Assign the status for each store in the route.
  storesInformation.map((storeInformation) => {
    stores.push({
      ...storeInformation,
      route_day_state: determineRouteDayState(enumStoreStates.NUETRAL_STATE, 1),
    });
  });

  resultGetStores.data = stores;

  return resultGetStores;
}

// Related to create the list of the stores
/*
  Function to create the list of stores to attend during the route day.
*/
export async function createListOfStoresOfTheRouteDay(
  routeDay:IRoute&IDayGeneralInformation&IDay&IRouteDay
):Promise<IResponse<(IStore&IStoreStatusDay)[]>> {
  const resultGetStoresOfRouteDay:IResponse<IRouteDayStores[]>
  = await getStoresOfRouteDay(routeDay);

  const storesInTheRoute:IRouteDayStores[] = getDataFromApiResponse(resultGetStoresOfRouteDay);

  const resultGetStoresOfRoute:IResponse<(IStore&IStoreStatusDay)[]>
    = await getStoresInformation(storesInTheRoute);

  const storesOfRoute:(IStore&IStoreStatusDay)[] = getDataFromApiResponse(resultGetStoresOfRoute);

  const resultInsertionStores:IResponse<(IStore&IStoreStatusDay)[]>
    = await insertStores(storesOfRoute);

  if(apiResponseStatus(resultGetStoresOfRouteDay, 200)
  && apiResponseStatus(resultGetStoresOfRoute, 200)
  && apiResponseStatus(resultInsertionStores, 201)) {
    /* There are not instructions */
  } else {
    await deleteAllStores();
    resultInsertionStores.responseCode = 400;
  }

  return resultInsertionStores;
}

export async function cleanAllStoresFromDatabase() {
  return await deleteAllStores();
}

