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
import { AppDispatch, RootState } from '../redux/store';
import { setUser } from '../redux/slices/userSlice';
import { setArrayDayOperations } from '../redux/slices/dayOperationsSlice';
import {
  setDayInformation,
  setRouteInformation,
  setRouteDay,
  setAllGeneralInformation,
} from '../redux/slices/routeDaySlice';
import { setCurrentOperation } from '../redux/slices/currentOperationSlice';

// Components
import Card from '../components/Card';
import MainMenuHeader from '../components/MainMenuHeader';
import ActionDialog from '../components/ActionDialog';

// Interfaces
import {
  ICompleteRoute,
  ICompleteRouteDay,
  IDayOperation,
  IResponse,
  IRoute,
  IRouteDay,
  IUser,
} from '../interfaces/interfaces';

// Utils
import DAYS from '../lib/days';
import { current_day_name } from '../utils/momentFormat';
import { capitalizeFirstLetter } from '../utils/generalFunctions';
import DAYS_OPERATIONS from '../lib/day_operations';
import { apiResponseProcess } from '../utils/apiResponse';


// Testing
import { testingUser } from '../moocks/user';
import { setProductInventory } from '../redux/slices/productsInventorySlice';
import { setStores } from '../redux/slices/storesSlice';

// Initializing database repository.
let repository = RepositoryFactory.createRepository('supabase');

// Extract queriyes
const {
  getAllRoutesByVendor,
  getAllDaysByRoute,
} = repository;

async function formattingDaysOfTheVendor(vendor:IUser):Promise<ICompleteRoute[]> {
  try {
    let completeRoutes:ICompleteRoute[] = [];
    let currentRoute: ICompleteRoute;
    let routes:IRoute[] = [];
    let daysOfRoute:IRouteDay[] = [];
    let completeDaysOfRoute: ICompleteRouteDay[] = [];

    // Responses
    const settingResponseRoutesByVendor:any = {
      showErrorMessage: true,
      toastTitleError: 'Error durante la consulta de los dias las rutas',
      toastMessageError: 'Ha habido un error durante la consulta de los dias de la ruta, por favor intente nuevamente',
    };
    const settingResponseDaysOfRoutesByVendor:any = {
      showErrorMessage: true,
      toastTitleError: 'Error durante la consulta de los dias de rutas',
      toastMessageError: 'Ha habido un error durante la consulta de los dias de la ruta, por favor intente nuevamente.',
    };

    // Getting all vendor's routes
    routes = apiResponseProcess(await getAllRoutesByVendor(vendor.id_vendor),
      settingResponseRoutesByVendor);

    // Getting all the days in a route
    for (let i = 0; i < routes.length; i++) {
      daysOfRoute = apiResponseProcess(await getAllDaysByRoute(routes[i].id_route),
        settingResponseDaysOfRoutesByVendor);

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
    Toast.show({type: 'error',
      text1:'Error durante la consulta de las rutas',
      text2: 'Ha habido un error durante la consulta de las rutas que tiene asignado el vendedor, por favor intente nuevamente',
    });

    return [];
  }
}

const RouteSelectionLayout = ({ navigation }:{navigation:any}) => {
  // Redux (context definitions)
  const dispatch: AppDispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  // Use states definition
  const [routes, setRoutes] = useState<ICompleteRoute[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [pendingToAcceptRoute, setPendingToAcceptRoute] = useState<IRoute|undefined>(undefined);
  const [pendingToAcceptRouteDay, setPendingToAcceptRouteDay] = useState<ICompleteRouteDay|undefined>(undefined);


  // Setting the john doe user for testing
  /*
    TODO: This request is made at the beginning of the application (login)
  */


  // Setting the current operation 'start shift inventory' (first operation of the day).
  dispatch(setCurrentOperation({
    id_day_operation: '', // Specifying that this operation belongs to this day.
    id_item: '',          // It is still not an operation.
    id_type_operation: DAYS_OPERATIONS.start_shift_inventory,
    operation_order: 0,
    current_operation: 0,
  }));

  useEffect(() => {
    // Store information in state.
    // dispatch(setUser(testingUser));
    /*
      In the system can exist different routes (route 1, route 2, route 3), each
      route is made by "route day" this concept refers that each route will have
      stores to visit by each day.

      Wrapping up:
      vendor <-(has a vendor) route <-(belongs to a route) day route

      So, monday of route 1 to thursday of route 1 can differ in the stores that must visit.

      In addition, each route will have assigend a vendor who is in charge of maintin the route.
    */



    // Determining if there is an initialized day.
    const settingResponseDayOperations:any = {
      showErrorMessage: true,
      toastTitleError: 'Error durante la consulta de las operaciones',
      toastMessageError: 'Al momento de intentar consultar las operaciones del dia de hoy ha habido un error, por favor intente nuevamente',
    };

    const settingResponseWorkDay:any = {
      showErrorMessage: true,
      toastTitleError: 'Error durante la consulta del dia de trabajo',
      toastMessageError: 'Al momento de intentar consultar la información general del dia ha habido un error, por favor intente nuevamente',
    };

    const settingResponseProducts:any = {
      showErrorMessage: true,
      toastTitleError: 'Error durante la consulta de los productos',
      toastMessageError: 'Al momento de intentar consultar los productos para hacer el inventario ha habido un error, por favor intente nuevamente',
    };

    const settingResponseStores:any = {
      showErrorMessage: true,
      toastTitleError: 'Error durante la consulta de las tiendas',
      toastMessageError: 'Al momento de intentar consultar las tiendas para cargar el dia ha habido un error, por favor intente nuevamente',
    };

    getDayOperations()
    .then(async (dayOperationsResponse:IResponse<IDayOperation[]>) => {

      let dayOperations:IDayOperation[] = apiResponseProcess(dayOperationsResponse,
        settingResponseDayOperations);

      if (dayOperations.length > 0) {
        /*
          It means it is a day operation, so it is necessary to get retrieve the information and
          set it in the context.
        */

        // Getting general information of the day.
        console.log("Getting the information of the day")

        Toast.show({type: 'info',
          text1:'Consultando información',
          text2: 'Recuperando la información del dia.'});

        dispatch(setAllGeneralInformation(
          apiResponseProcess(await getWorkDay(), settingResponseWorkDay)));

        // Setting the operations of the day
        console.log("Getting the day operations")
        dispatch(setArrayDayOperations(dayOperations));

        // Setting inventory of the day
        console.log("Getting products")
        dispatch(setProductInventory(
          apiResponseProcess(await getProducts(), settingResponseProducts)));

        // Setting the information of the stores to visit
        console.log("Getting stores")
        dispatch(setStores(apiResponseProcess(await getStores(), settingResponseStores)));

        console.log("Navigation")
        navigation.navigate('routeOperationMenu');
      } else {
        /* It is a new 'work' day. */
        // Getting all the routes assigned to a vendor
        Toast.show({type: 'info',
          text1:'Consultando rutas',
          text2: 'Consultando rutas disponibles para el vendedor'});

        formattingDaysOfTheVendor(testingUser)
          .then((routesOfVendor:ICompleteRoute[]) => { setRoutes(routesOfVendor); });
      }
    });
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
    getUsers().then(async (userResponse:IResponse<IUser[]>) => {
      const settingResponseUser:any = {
        showErrorMessage: true,
        toastTitleError: 'Error durante la obtención de los datos del usuario',
        toastMessageError: 'Ha ocurrido un error al momento de consultar la información del vendedor, por favor intente nuevamente',
      };

      let responseUsers:IUser[] = apiResponseProcess(userResponse, settingResponseUser);

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
    })
    .catch((error:any) => {console.log('There was an error consulting the database: ', error); });

    navigation.navigate('selectionRouteOperation');
  };

  //Handlers
  const handlerOnSelectARoute = (route:IRoute, routeDay:ICompleteRouteDay) => {
    // Verifying that the selected route actually corresponds to make today.
    if (current_day_name().toLocaleLowerCase()
      === DAYS[routeDay.id_day].day_name.toLocaleLowerCase()){
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
        })
        :
        <View style={tw`h-full flex flex-col justify-center`}>
          <ActivityIndicator size={'large'} />
        </View>
      }
    </View>
  );
};

export default RouteSelectionLayout;
