//Libraries
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import 'react-native-get-random-values'; // Necessary for uuid
import {v4 as uuidv4 } from 'uuid';
import { ActivityIndicator } from 'react-native-paper';

// Queries
// Main database
import {
  getAllRoutesByVendor,
  getAllDaysByRoute,
} from '../queries/queries';

// Embedded database
import {
  insertUser,
  getUsers,
} from '../queries/SQLite/sqlLiteQueries';

// Utils
import DAYS from '../lib/days';
import { current_day_name } from '../utils/momentFormat';


// Redux States and reducers
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { setUser } from '../redux/slices/userSlice';
import { setDayOperation } from '../redux/slices/dayOperationsSlice';
import {
  setDayInformation,
  setRouteInformation,
  setRouteDay,
} from '../redux/slices/routeDaySlice';

// Components
import Card from '../components/Card';
import MainMenuHeader from '../components/MainMenuHeader';
import { ICompleteRoute, ICompleteRouteDay, IRoute, IUser } from '../interfaces/interfaces';
import ActionDialog from '../components/ActionDialog';
import { capitalizeFirstLetter } from '../utils/generalFunctions';

// Testing
import { testingUser } from '../moocks/user';


const RouteSelectionLayout = ({ navigation }:{navigation:any}) => {
  // Redux (context definitions)
  const dispatch: AppDispatch = useDispatch();

  // Use states definition
  const [routes, setRoutes] = useState<ICompleteRoute[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [pendingToAcceptRoute, setPendingToAcceptRoute] = useState<IRoute|undefined>(undefined);
  const [pendingToAcceptRouteDay, setPendingToAcceptRouteDay] = useState<ICompleteRouteDay|undefined>(undefined);


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

          // Ordering the days
          arrRouteDays.sort((a, b) => a.day.order_to_show - b.day.order_to_show);

          currentRoute = {
            ...currentRouteData,
            description: capitalizeFirstLetter(currentRouteData.description),
            route_name: capitalizeFirstLetter(currentRouteData.route_name),
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
    // Store information in state.
    dispatch(setUser(testingUser));
  },[]);

  // Auxiliar functions
  const storeRouteSelected = (route:IRoute, routeDay:ICompleteRouteDay) => {
    /*
      In this function, it is only stored information in the redux state and not in the
      embedded database, because it is not know if the vendor is going to change from one route
      to another route.
      In this way, when the vendor finishes the initial inventory process is when the route information is
      actually stored in the embedded database.
    */

    // Storing information realted to the route.
    dispatch(setRouteInformation(route));

    // Storing information related to the day
    dispatch(setDayInformation(routeDay.day));

    //Storing information related to the relation between the route and the day.
    dispatch(setRouteDay(routeDay));

    /*
      As part of the configuration for the initial day, it is necessary to store information related
      to the work day operation
    */

    // Verifying there is not a registerd user.
    getUsers().then(async (responseUsers:IUser[]) => {
      const userFound:IUser|undefined = responseUsers.find((responseUser:IUser) => {
        return responseUser.id_vendor === testingUser.id_vendor;
      });
      if (userFound === undefined) {
        // Store information in embeddded database.
        await insertUser(testingUser);
      } else {
        /*
          It means the user already exists, so it is not necessary to save the user or vendor.
        */
      }
    });

    navigation.navigate('selectionRouteOperation');
  };

  //Handlers
  const handlerOnSelectARoute = (route:IRoute, routeDay:ICompleteRouteDay) => {
    // Verifying that the selected route actually corresponds to make today.
    if (current_day_name().toLocaleLowerCase() === DAYS[routeDay.id_day].day_name.toLocaleLowerCase()){
      // The route selected is the route that corresponds to make today.
      storeRouteSelected(route, routeDay);
      setShowDialog(false);
      setPendingToAcceptRoute(undefined);
      setPendingToAcceptRouteDay(undefined);
    } else {
      // The route selectes doesn't correspond to make today.
      setShowDialog(true);
      setPendingToAcceptRoute(route);
      setPendingToAcceptRouteDay(routeDay);
    }
  };

  const handlerOnCancelMakeRoute = () => {
    setShowDialog(false);
    setPendingToAcceptRoute(undefined);
    setPendingToAcceptRouteDay(undefined);
  };

  const handlerOnAcceptMakeRoute = () => {
    if(pendingToAcceptRoute !== undefined && pendingToAcceptRouteDay !== undefined) {
      storeRouteSelected(pendingToAcceptRoute, pendingToAcceptRouteDay);
    }
      setShowDialog(false);
      setPendingToAcceptRoute(undefined);
      setPendingToAcceptRouteDay(undefined);
  };

  return (
    <View style={tw`w-full h-full`}>
        <ActionDialog
          visible={showDialog}
          onAcceptDialog={handlerOnAcceptMakeRoute}
          onDeclinedialog={handlerOnCancelMakeRoute}>
            <View style={tw`w-11/12 flex flex-col`}>
              <Text style={tw`text-center text-black text-xl`}>
                Este dia de la ruta no corresponde hacerla hoy. ¿Estas seguro seguir adelante?
              </Text>
              <Text style={tw`my-2 text-center text-black text-xl font-bold`}>
                Ruta a hacer: {pendingToAcceptRoute?.route_name}
              </Text>
              <Text style={tw`my-2 text-center text-black text-xl font-bold`}>
                Dia: {pendingToAcceptRouteDay?.day.day_name}
              </Text>
            </View>
        </ActionDialog>
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
                  routeName={route.route_name}
                  day={routeDay.day.day_name!}
                  description={route.description}
                  route={route}
                  routeDay={routeDay}
                  onSelectCard={handlerOnSelectARoute}
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
