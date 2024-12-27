// Libraries
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import tw from 'twrnc';

// Interface and enums
import {
  IDayOperation,
  IRouteTransaction,
  IRouteTransactionOperation,
  IRouteTransactionOperationDescription,
  IStore,
  IStoreStatusDay,
} from '../interfaces/interfaces';

// Components
import RouteMap from '../components/RouteMap';
import SummarizeTransaction from '../components/TransactionComponents/SummarizeTransaction';
import MenuHeader from '../components/generalComponents/MenuHeader';

// Redux context
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { cleanCurrentOperation } from '../redux/slices/currentOperationSlice';

// Embedded database
import {
  getRouteTransactionByStore,
  getRouteTransactionOperationDescriptions,
  getRouteTransactionOperations,
} from '../queries/SQLite/sqlLiteQueries';

// Utils
import { getStoreFromContext } from '../utils/routesFunctions';
import DAYS_OPERATIONS from '../lib/day_operations';
import Toast from 'react-native-toast-message';
import { apiResponseProcess } from '../utils/apiResponse';


function buildAddress(store:IStore) {
  let address = '';

  if (store.street !== ''){
    address = address + store.street + ' ';
  }

  if (store.ext_number !== ''){
    address = address + '#' + store.ext_number + '';
  }

  if (store.colony !== ''){
    address = address + ', ' + store.colony;
  }

  return address;
}

function displayingClientInformation(store:IStore) {
  let ownerStoreInformation = '';
  if ((store.owner_name !== '' && store.owner_name !== null)  && (store.cellphone !== '' && store.cellphone !== null)) {
    ownerStoreInformation = store.owner_name + ' | ' + store.cellphone;
  } else if ((store.owner_name !== ''
            && store.owner_name !== null
            && store.owner_name !== undefined) &&
            (store.cellphone === ''
            || store.owner_name === null
            || store.owner_name === undefined)) {
    ownerStoreInformation = store.owner_name;
  } else if ((store.owner_name === ''
            || store.owner_name === null
            || store.owner_name === undefined) &&
            (store.cellphone !== ''
            && store.cellphone !== null
            && store.cellphone !== undefined)){
    ownerStoreInformation = store.cellphone;
  } else {
    ownerStoreInformation = 'No disponible';
  }

  return ownerStoreInformation;
}

const StoreMenuLayout = ({ navigation }:{ navigation:any}) => {

  //Defining redux context
  const dispatch: AppDispatch = useDispatch();
  const currentOperation = useSelector((state: RootState) => state.currentOperation);
  const stores = useSelector((state: RootState) => state.stores);
  const dayOperations = useSelector((state: RootState) => state.dayOperations);

  // Defining state
  const [isConsultTransaction, setIsConsultTransaction] = useState<boolean>(false);
  const [routeTransactions, setRouteTransactions] = useState<IRouteTransaction[]>([]);
  const [ routeTransactionOperations, setRouteTransactionOperations]
    = useState<Map<string, IRouteTransactionOperation[]>>(new Map());
  const [
    routeTransactionOperationDescriptions,
    setRouteTransactionOperationDescriptions,
  ] = useState<Map<string, IRouteTransactionOperationDescription[]>>(new Map());

  // Definig only-read variables
  let store:IStore&IStoreStatusDay = getStoreFromContext(currentOperation, stores);

  // handlers
  const handlerGoBackToMainOperationMenu = () => {
    dispatch(cleanCurrentOperation());
    navigation.navigate('routeOperationMenu');
  };

  const handlerGoBackToStoreMenu = () => {
    setIsConsultTransaction(false);
  };

  const handlerOnStartSale = () => {
    navigation.navigate('sales');
  };

  const handlerOnConsultTransactions = async() => {
    try {
      // Variables used throughout the logic of the handler
      const arrTransactions:IRouteTransaction[] = [];
      const mapTransactionOperations = new Map<string, IRouteTransactionOperation[]>();
      const mapTransactionOperationDescriptions = new Map<string, IRouteTransactionOperationDescription[]>();

      const settingRouteTransactionByStore:any = {
        showErrorMessage: true,
        toastTitleError: 'Error durante la consulta de las transacciones de la tienda.',
        toastMessageError: 'Ha habido un error durante la consulta, no se ha podido recuperar la información, por favor intente nuevamente',
      };
      const settingTransactionsOperation:any = {
        showErrorMessage: true,
        toastTitleError: 'Error durante la consulta de las operaciones de las trasnsacciones.',
        toastMessageError: 'Ha habido un error durante la consulta, no se ha podido recuperar la información, por favor intente nuevamente',
      };

      /* Getting all the transaciton of the store of today. */
      apiResponseProcess((
        await getRouteTransactionByStore(store.id_store)),
        settingRouteTransactionByStore)
      .forEach((transaction:IRouteTransaction) => {
        arrTransactions.push(transaction);
      });

      /* Getting all the transaction operations from the transaction of today. */
      for (const transaction of arrTransactions) {
        const { id_route_transaction } = transaction;
        mapTransactionOperations.set(
          id_route_transaction,
          apiResponseProcess(
            await getRouteTransactionOperations(id_route_transaction),
            settingTransactionsOperation)
        );
      }

      /* Getting all the descriptions (or movements) of the transaction operations of today. */
      for (const [key, transactionOperation] of mapTransactionOperations.entries()) {
        for (const currentTransactionOperation of transactionOperation) {
          const { id_route_transaction_operation } = currentTransactionOperation;
          mapTransactionOperationDescriptions.set(
            id_route_transaction_operation,
            apiResponseProcess(await getRouteTransactionOperationDescriptions(id_route_transaction_operation),
            settingTransactionsOperation)
          );
        }
      }

      setRouteTransactions(arrTransactions);
      setRouteTransactionOperations(mapTransactionOperations);
      setRouteTransactionOperationDescriptions(mapTransactionOperationDescriptions);
      setIsConsultTransaction(true);

    } catch (error) {
      Toast.show({type: 'error',
        text1:'Error al consultar las ventas de la tienda',
        text2: 'Ha habido un error al intentar recuperar la información de la tienda.'});
    }
  };

  return (!isConsultTransaction ?
    // Main menu of store
    <View style={tw`w-full flex-1 justify-center items-center`}>
      <View style={tw`w-full flex my-5 flex-row justify-around items-center`}>
        <MenuHeader onGoBack={handlerGoBackToMainOperationMenu}/>
      </View>
      <View style={tw`h-1/2 w-11/12 flex-1 border-solid border-2 rounded-sm`}>
        <RouteMap
          latitude={parseFloat(store.latitude)}
          longitude={parseFloat(store.longuitude)}/>
      </View>
      <View style={tw`flex-1 w-11/12 flex-col`}>
        <View style={tw`flex flex-row basis-1/3 justify-around items-center`}>
          <View style={tw`flex flex-col basis-1/2 justify-around`}>
            <Text style={tw`text-black text-xl`}>Dirección</Text>
            <Text style={tw`text-black`}>{buildAddress(store)}</Text>
          </View>
          <View style={tw`flex flex-col basis-1/2 justify-around`}>
            <Text style={[tw`text-black text-xl`, { lineHeight: 20! }]}>
              Información del cliente
            </Text>
            <Text style={tw`text-black`}> {displayingClientInformation(store)} </Text>
          </View>
        </View>
        <View style={tw`flex flex-col basis-1/3 justify-center`}>
          <Text style={tw`text-black text-xl`}>Referencia</Text>
          <Text style={tw`text-black`}>
            { store.address_reference === '' || store.address_reference === null ?
              'No Disponible' :
              store.address_reference
            }
          </Text>
        </View>
        <View style={tw`h-3/5 h-1/2 flex flex-row basis-1/3 justify-around items-center`}>
          <View style={tw`h-1/2 flex basis-1/2 justify-center items-center`}>
            <Pressable
              style={tw`w-11/12 h-full border-solid border bg-blue-500 
                rounded flex flex-row justify-center items-center`}
              onPress={() => {handlerOnConsultTransactions();}}>
              <Text style={tw`text-center text-black`}>Transacciones de hoy</Text>
            </Pressable>
          </View>
          <View style={tw`h-1/2 flex basis-1/2 justify-center items-center`}>
            <Pressable
              style={tw`h-full w-11/12 bg-green-500 rounded border-solid border
                        flex flex-row justify-center items-center`}
              onPress={() => {
                const endShiftInventoryOperation:IDayOperation|undefined
                  = dayOperations.find(dayOperation =>
                      dayOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory);

                if (endShiftInventoryOperation === undefined) {
                  /* There is not an end shift operation, the work day is still open. So, user can make more operations*/
                  handlerOnStartSale();
                } else {
                  /*There is an end shift operation, the work day was closed. */
                  Toast.show({type: 'error', text1:'Inventario final finalizado', text2: 'No se pueden hacer mas operaciones'});
                }
              }}>
              <Text style={tw`text-center text-black`}>Iniciar venta</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View> :
    // Transaction visualization
    <View style={tw`w-full flex-1 justify-start items-center`}>
      <View style={tw`w-full flex my-5 flex-row justify-around items-center`}>
        <MenuHeader onGoBack={handlerGoBackToStoreMenu}/>
      </View>
        { routeTransactions.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            { routeTransactions.map(current_transaction => {
              const id_current_transaction = current_transaction.id_route_transaction;
              const current_transaction_operations:IRouteTransactionOperation[] = [];
              const current_transaction_operation_descriptions = new Map<string, IRouteTransactionOperationDescription[]>();

              /* Getting the operations of the transactions */
              let transactionOperations = routeTransactionOperations.get(id_current_transaction);

              /* Avoiding undefined value for operations of the transaction */
              if (transactionOperations === undefined) {
                /* Do nothing */
              } else {
                /* Storing all the operations related to the current transaction */
                transactionOperations.forEach(operation => {
                  const {id_route_transaction_operation} = operation;
                  current_transaction_operations.push(operation);

                  /* Consulting the description of the operation */
                  let transactionOperationDescription = routeTransactionOperationDescriptions
                    .get(id_route_transaction_operation);

                  /* Avoiding undefined values for operation descriptions */
                  if (transactionOperationDescription === undefined) {
                    /* Do nothing*/
                  } else {
                    /*
                      If there were found description for the operation, then
                      store it in the map.
                    */
                    current_transaction_operation_descriptions
                      .set(id_route_transaction_operation, transactionOperationDescription);
                  }
                });
              }

              return (
                <SummarizeTransaction
                  key={id_current_transaction}
                  navigation={navigation}
                  routeTransaction={current_transaction}
                  routeTransactionOperations={current_transaction_operations}
                  routeTransactionOperationDescriptions={current_transaction_operation_descriptions}
                  />
              );
            })}
          <View style={tw`h-32`}/>
          </ScrollView>
        ) : (
          <View style={tw`w-10/12 h-full flex flex-col items-center justify-center`}>
            <Text style={tw`text-xl font-bold mb-20 text-center`}>
              Aún no hay ventas realizadas para esta tienda
            </Text>
          </View>
        )
      }
    </View>
  );
};

export default StoreMenuLayout;
