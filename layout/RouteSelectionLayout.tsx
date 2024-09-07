import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import Card from '../components/Card';
import MainMenuHeader from '../components/MainMenuHeader';
import { getAllRoutesByVendor, getAllDaysByRoute } from '../queries/queries';
import { IDay, IRoute, IRouteDay } from '../interfaces/interfaces';
import DAYS from '../lib/days';

import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { setUser } from '../redux/slices/userSlice';

interface ICompleteRouteDay extends IRouteDay {
  day: IDay
}

interface ICompleteRoute extends IRoute {
  routeDays: ICompleteRouteDay[]
}

const RouteSelectionLayout = ({ navigation }) => {
  // Use states definition
  const [routes, setRoutes] = useState<ICompleteRoute[]>([]);

  // Redux (context definitions)
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    // Getting all routes
    getAllRoutesByVendor(1).then(routesData => {
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
            console.log(...routes)
            console.log(currentRoute)
            setRoutes([...routes, currentRoute]);
          }
        });
      });
    });

    // Setting the john doe user for testing
    dispatch(setUser({
      id_vendor: 1,
      cellphone: '322-897-1324',
      name: 'Renet',
      password: '',
      status: 1,
    }));
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
