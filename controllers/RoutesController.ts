//Libraries
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import 'react-native-get-random-values'; // Necessary for uuid
import { ActivityIndicator } from 'react-native-paper';
import Toast from 'react-native-toast-message';

// Databases
// Main database
import { RepositoryFactory } from '../queries/repositories/RepositoryFactory';

// Embedded database
import {
  insertUser,
  getUsers,
  getDayOperations,
  getProducts,
  getStores,
  getWorkDay,
} from '../queries/SQLite/sqlLiteQueries';

// Redux States and reducers
import { useDispatch, useSelector } from 'react-redux';
import store, { AppDispatch, RootState } from '../redux/store';
import { setUser } from '../redux/slices/userSlice';
import { setArrayDayOperations } from '../redux/slices/dayOperationsSlice';
import {
  setDayInformation,
  setRouteInformation,
  setRouteDay,
  setAllGeneralInformation,
} from '../redux/slices/routeDaySlice';
import { setCurrentOperation } from '../redux/slices/currentOperationSlice';
import { capitalizeFirstLetter } from '../utils/generalFunctions';
import { apiResponseProcess, getDataFromApiResponse } from '../utils/apiResponse';
import { ICompleteRoute, ICompleteRouteDay, IRoute, IRouteDay, IUser } from '../interfaces/interfaces';
import DAYS from '../lib/days';

// Initializing database repository.
let repository = RepositoryFactory.createRepository('supabase');


/*
  In the system can exist different routes (route 1, route 2, route 3), each
  route is made by "route day" this concept refers that each route will have
  stores to visit by each day.

  Wrapping up:
  vendor <-(has a vendor) route <-(belongs to a route) day route

  So, monday of route 1 to thursday of route 1 can differ in the stores that must visit.

  In addition, each route will have assigend a vendor who is in charge of maintin the route.
*/
export async function getAvailableRoutesForTheVendor(vendor:IUser):Promise<ICompleteRoute[]> {
  try {
    let completeRoutes:ICompleteRoute[] = [];
    let currentRoute: ICompleteRoute;
    let routes:IRoute[] = [];
    let daysOfRoute:IRouteDay[] = [];
    let completeDaysOfRoute: ICompleteRouteDay[] = [];

    // Getting all vendor's routes
    routes = getDataFromApiResponse(await repository.getAllRoutesByVendor(vendor.id_vendor));

    // Getting all the days in a route
    for (let i = 0; i < routes.length; i++) {
      daysOfRoute = apiResponseProcess(await repository.getAllDaysByRoute(routes[i].id_route));

      /* Once all the days of a route have been gotten */
      // From the current days of a route, get the remaining information for each route.
      daysOfRoute.forEach(routeDay => {
        let completeRouteDay:ICompleteRouteDay = {
          ...routeDay,
          day: DAYS[routeDay.id_day],
        };
        completeDaysOfRoute.push(completeRouteDay);
      });

      // Ordering days of the route.
      completeDaysOfRoute.sort((a, b) => a.day.order_to_show - b.day.order_to_show);

      /*
        Storing the current route (this information contains both the complete information of the
        route and the information of each days that made up the route).
      */
      currentRoute = {
        ...routes[i],
        description: capitalizeFirstLetter(routes[i].description),
        route_name: capitalizeFirstLetter(routes[i].route_name),
        routeDays: completeDaysOfRoute,
      };
      // Avoiding store routes without days.
      if(completeDaysOfRoute[0] !== undefined) {
        completeRoutes.push(currentRoute);
      }
    }

    return completeRoutes;
  } catch (error) {
    return [];
  }
}

