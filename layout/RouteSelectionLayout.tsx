//Libraries
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import 'react-native-get-random-values'; // Necessary for uuid
import {v4 as uuidv4 } from 'uuid';
import { ActivityIndicator } from 'react-native-paper';

// Components
import Card from '../components/Card';
import MainMenuHeader from '../components/MainMenuHeader';
import { ICompleteRoute, ICompleteRouteDay } from '../interfaces/interfaces';

// Queries and utils
import DAYS from '../lib/days';
import { getAllRoutesByVendor, getAllDaysByRoute } from '../queries/queries';
import DAYS_OPERATIONS from '../lib/day_operations';

// Redux States and reducers
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { setUser } from '../redux/slices/userSlice';
import { setDayOperation } from '../redux/slices/dayOperationsSlice';

const RouteSelectionLayout = ({ navigation }:{navigation:any}) => {
  // Use states definition
  const [routes, setRoutes] = useState<ICompleteRoute[]>([]);

  // Redux (context definitions)
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    /*
      In the system can exist different routes (route 1, route 2, route 3), each route is made
      by "route day" this concept refers that each route will have stores to visit by each day.

      Wrapping up:
      vendor <-(has a vendor) route <-(belongs to a route) day route

      So, monday of route 1 to thursday of route 1 can differ in the stores that must visit.

      In addition, each route will have assigend a vendor who is in charge of maintin the route.
    */

    // Getting all the route assigned to a vendor
    getAllRoutesByVendor('58eb6f1c-29fc-46dd-bf19-caece0950257').then(routesData => {
      // Getting all the days in a route
      routesData.forEach(currentRouteData => {
        getAllDaysByRoute(currentRouteData.id_route)
        .then(routeDaysData => {
          let currentRoute: ICompleteRoute;
          let arrRouteDays: ICompleteRouteDay[] = [];

          // Getting the name of the day
          routeDaysData.forEach(routeDayData => {
            let routeDay:ICompleteRouteDay = {
              ...routeDayData,
              day: DAYS[routeDayData.id_day],
            };
            arrRouteDays.push(routeDay);
          });

          currentRoute = {
            ...currentRouteData,
            routeDays: arrRouteDays,
          };

          // Avoiding store routes without days.
          if(arrRouteDays[0] !== undefined) {
            let index = routes.findIndex(route => route.id_route === currentRoute.id_route);
            // Avoiding duplicate records
            if (index === -1) {
              // The route doesn't exist
              setRoutes([...routes, currentRoute]);
            } else {
              setRoutes(routes.map(route => route.id_route === currentRoute.id_route ? currentRoute : route));
            }
          }
        });
      });
    });

    // Setting the john doe user for testing
    /*
      TODO: This request is made at the beginning of the application (login)
    */
    dispatch(setUser({
      id_vendor: '58eb6f1c-29fc-46dd-bf19-caece0950257',
      cellphone: '322-897-1324',
      name: 'Renet',
      password: '',
      status: 1,
    }));

    /*
      According with the flow of the business operation, after selecting the route,
      the vendor must make an "start_shift_inventory operation" to have products for selling.

      So, the next operation (after selecting the route) is make the inventory.
    */
    dispatch(setDayOperation({
      id_day_operation: uuidv4(),
      id_item: '',
      id_type_operation: DAYS_OPERATIONS.start_shift_inventory,
      operation_order: 0,
      current_operation: 1,
    }));
  },[]);

  return (
    <View style={tw`w-full h-full`}>
      <MainMenuHeader/>

      { routes.length > 0 ?
        routes.map((route:ICompleteRoute) => {
          return <View
            style={tw`w-full h-full flex flex-col items-center`}
            key={route.id_route}>
            { route.routeDays.map((routeDay:ICompleteRouteDay) => {
              return (
                <Card
                  key={routeDay.id_day}
                  navigation={navigation}
                  goTo={'selectionRouteOperation'}
                  routeName={route.route_name}
                  day={routeDay.day.day_name!}
                  description={route.description}
                  route={route}
                  routeDay={routeDay}
                  />
              );
            })}
          </View>;
        }) :
        <View style={tw`h-full flex flex-col justify-center`}>
          <ActivityIndicator size={'large'} />
        </View>
      }
    </View>
  );
};

export default RouteSelectionLayout;
