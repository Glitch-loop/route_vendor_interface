import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import Card from '../components/Card';
import MainMenuHeader from '../components/MainMenuHeader';
import { getAllRoutesByVendor, getAllDaysByRoute } from '../queries/queries';
import { ICompleteRoute, ICompleteRouteDay } from '../interfaces/interfaces';
import DAYS from '../lib/days';

import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { setUser } from '../redux/slices/userSlice';

const RouteSelectionLayout = ({ navigation }:{navigation:any}) => {
  // Use states definition
  const [routes, setRoutes] = useState<ICompleteRoute[]>([]);

  // Redux (context definitions)
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    // Getting all routes
    getAllRoutesByVendor('58eb6f1c-29fc-46dd-bf19-caece0950257').then(routesData => {
      // Getting all the days in a route
      routesData.forEach(currentRouteData => {
        getAllDaysByRoute(currentRouteData.id_route)
        .then(routeDaysData => {
          let currentRoute: ICompleteRoute;
          let arrRouteDays: ICompleteRouteDay[] = [];
          // Getting the name of the day
          routeDaysData.forEach(routeDayData => {
            let routeDay:ICompleteRouteDay = routeDayData;
            routeDay.day = DAYS[routeDay.id_day];
            arrRouteDays.push(routeDay);
          });

          currentRoute = {
            ...currentRouteData,
            routeDays: arrRouteDays,
          };

          // Avoiding store routes without days.
          if(arrRouteDays[0] !== undefined) {
            setRoutes([...routes, currentRoute]);
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
      According with the flow of the operation, after selecting the route, the vendor must made an
      start_shift_inventory operation to have products for selling.

    */
  },[]);

  return (
    <View style={tw`w-full h-full`}>
      <MainMenuHeader/>
      {routes.map((route:ICompleteRoute) => {
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
                day={routeDay.day.day_name}
                description={route.description}
                route={route}
                routeDay={routeDay}
                />
            );
          })}
        </View>;
      })}
    </View>
  );
};

export default RouteSelectionLayout;
