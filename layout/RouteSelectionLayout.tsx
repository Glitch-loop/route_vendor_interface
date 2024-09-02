import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import Card from '../components/Card';
import MainMenuHeader from '../components/MainMenuHeader';
import { 
  getAllRoutesByVendor,
  getAllDaysByRoute,
} from '../endpoints/endpoint';
import { IDay, IRoute, IRouteDay } from '../interfaces/interfaces';
import DAYS from '../lib/days';

interface ICompleteRouteDay extends IRouteDay {
  day: IDay
}

interface ICompleteRoute extends IRoute {
  routeDays: ICompleteRouteDay[]
}

const RouteSelectionLayout = ({ navigation }) => {
  const [routes, setRoutes] = useState<ICompleteRoute[]>([]);

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

          currentRoute = currentRouteData;
          currentRoute.routeDays = arrRouteDays;

          // Avoiding store routes without days.
          if(arrRouteDays[0] !== undefined) {
            console.log("ROUTE: ", currentRoute.route_name)
            console.log("ROUTE DAYS: ", arrRouteDays)
            console.log("ROUTE DAYS: ", arrRouteDays.length)
            setRoutes([...routes, currentRoute]);
          }
        });
      });
    });
  },[]);

  return (
    <View style={tw`w-full h-full`}>
      <MainMenuHeader user={'John Doe'}  cellphone={'xxx-xxx-xxxx'} />
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
                route={route.route_name}
                day={routeDay.day.day_name}
                description={route.description}
                />
            );
          })}
        </View>;
      })}
    </View>
  );
};

export default RouteSelectionLayout;
