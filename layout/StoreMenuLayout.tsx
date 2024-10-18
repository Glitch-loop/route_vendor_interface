// Libraries
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import tw from 'twrnc';

// Interface and enums
import { enumStoreStates } from '../interfaces/enumStoreStates';

// Components
import RouteMap from '../components/RouteMap';
import SummarizeTransaction from '../components/TransactionComponents/SummarizeTransaction';

// Redux context
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { clearCurrentOperation } from '../redux/slices/currentOperationSlice';
import { IDayOperation, IRouteTransaction, IRouteTransactionOperation, IRouteTransactionOperationDescription, IStore, IStoreStatusDay } from '../interfaces/interfaces';
import GoButton from '../components/generalComponents/GoButton';
import { getRouteTransactionByStore, getRouteTransactionOperationDescriptions, getRouteTransactionOperations } from '../queries/SQLite/sqlLiteQueries';

const defaultStore:IStore&IStoreStatusDay = {
  id_store: '',
  street: '',
  ext_number: '',
  colony: '',
  postal_code: '',
  address_reference: '',
  store_name: '',
  owner_name: '',
  cellphone: '',
  latitude: '',
  longuitude: '',
  id_creator: 0,
  creation_date: '',
  creation_context: '',
  status_store: '',
  route_day_state: enumStoreStates.NUETRAL_STATE,
};

function getStoreFromContext(idStore:string, stores:(IStore&IStoreStatusDay)[]) {
  const foundStore:IStore&IStoreStatusDay|undefined = stores
  .find((store) => { return store.id_store === idStore; });

  if (foundStore === undefined) {
    return defaultStore;
  } else {
    return foundStore;
  }
}

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

function contextOfStore(store:IStore&IStoreStatusDay, currentOperation:IDayOperation) {
  let style = '';


  if (currentOperation.current_operation === 1) {
    style = 'flex flex-row h-6 w-6 bg-indigo-500 rounded-full';
  } else {
    if (store.route_day_state === enumStoreStates.NEW_CLIENT) {
      style = 'flex flex-row h-6 w-6 bg-green-400 rounded-full';
    } else if (store.route_day_state === enumStoreStates.SPECIAL_SALE) {
      style = 'flex flex-row h-6 w-6 bg-green-600 rounded-full';
    } else if (store.route_day_state === enumStoreStates.REQUEST_FOR_SELLING) {
      style = 'flex flex-row h-6 w-6 bg-amber-500 rounded-full';
    } else if (store.route_day_state === enumStoreStates.SERVED) {
      style = 'flex flex-row h-6 w-6 bg-amber-200/75 rounded-full';
    } else {
      style = 'flex flex-row h-6 w-6 bg-amber-200/75 rounded-full';
    }
  }

  return style;
}

const StoreMenuLayout = ({ navigation }:{ navigation:any}) => {

  //Defining redux context
  const dispatch: AppDispatch = useDispatch();
  const currentOperation = useSelector((state: RootState) => state.currentOperation);
  const stores = useSelector((state: RootState) => state.stores);

  // Defining state
  const [store, setStore] =
    useState<IStore&IStoreStatusDay>(getStoreFromContext(currentOperation.id_item, stores));
  const [isConsultTransaction, setIsConsultTransaction] = useState<boolean>(false);
  const [routeTransactions, setRouteTransactions] = useState<IRouteTransaction[]>([]);
  const [
    routeTransactionOperations,
    setRouteTransactionOperations,
  ] = useState<Map<string, IRouteTransactionOperation[]>>(new Map());
  const [
    routeTransactionOperationDescriptions,
    setRouteTransactionOperationDescriptions,
  ] = useState<Map<string, IRouteTransactionOperationDescription[]>>(new Map());

  useEffect(() => {
    setStore(getStoreFromContext(currentOperation.id_item, stores));
  },[currentOperation]);

  // handlres
  const handlerGoBackToMainOperationMenu = () => {
    dispatch(clearCurrentOperation());
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
      const arrTransactions:IRouteTransaction[] = [];
      const mapTransactionOperations = new Map<string, IRouteTransactionOperation[]>();
      const mapTransactionOperationDescriptions = new Map<string, IRouteTransactionOperationDescription[]>();


      /* Getting all the transaciton of the store of today. */
      (await getRouteTransactionByStore(store.id_store))
      .forEach((transaction:IRouteTransaction) => {
        console.log(transaction)
        arrTransactions.push(transaction);
      });

      /* Getting all the transaction operations from the transaction of today. */
      for (const transaction of arrTransactions) {
        const { id_route_transaction } = transaction;
        mapTransactionOperations.set(
          id_route_transaction,
          await (getRouteTransactionOperations(id_route_transaction))
        );
      }

      /* Getting all the descriptions (or movements) of the transaction operations of today. */
      for (const [key, transactionOperation] of mapTransactionOperations.entries()) {
        for (const currentTransactionOperation of transactionOperation) {
          const { id_route_transaction_operation } = currentTransactionOperation;
          mapTransactionOperationDescriptions.set(
            id_route_transaction_operation,
            await getRouteTransactionOperationDescriptions(id_route_transaction_operation)
          );
        }
      }

      console.log(arrTransactions)
      console.log(mapTransactionOperations)
      console.log(mapTransactionOperationDescriptions)
      console.log(true)

      setRouteTransactions(arrTransactions);
      setRouteTransactionOperations(mapTransactionOperations);
      setRouteTransactionOperationDescriptions(mapTransactionOperationDescriptions);
      setIsConsultTransaction(true);

    } catch (error) {
      console.error('Something was wrong during transaction retrieving: ', error);
    }
  };


  return (!isConsultTransaction ?
    // Main menu of store
    <View style={tw`w-full flex-1 justify-center items-center`}>
      <View style={tw`w-full flex my-5 flex-row justify-around items-center`}>
        <GoButton
          iconName={'chevron-left'}
          onPressButton={handlerGoBackToMainOperationMenu}/>
          <Text style={tw`text-3xl text-black`}>Ruta 1</Text>
          <Text style={tw`text-2xl text-black mx-1`}>|</Text>
          <Text style={tw`text-xl  text-black max-w-1/2`}>{store.store_name}</Text>
          <View style={tw`${contextOfStore(store, currentOperation)}`} />
      </View>
      <View style={tw`h-1/2 w-11/12 flex-1 border-solid border-2 rounded-sm`}>
        <RouteMap
          latitude={parseFloat(store.latitude)}
          longitude={parseFloat(store.longuitude)}
        />
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
              onPress={() => {handlerOnStartSale();}}>
              <Text style={tw`text-center text-black`}>Iniciar venta</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View> :
    // Transaction visualization
    <View style={tw`w-full flex-1 justify-start items-center`}>
      <View style={tw`w-full flex my-5 flex-row justify-around items-center`}>
        <GoButton
          iconName={'chevron-left'}
          onPressButton={handlerGoBackToStoreMenu}/>
          <Text style={tw`text-3xl text-black`}>Ruta 1</Text>
          <Text style={tw`text-2xl text-black mx-1`}>|</Text>
          <Text style={tw`text-xl  text-black max-w-1/2`}>{store.store_name}</Text>
          <View style={tw`${contextOfStore(store, currentOperation)}`} />
      </View>
        { routeTransactions.length > 0 ?
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
                  routeTransaction={current_transaction}
                  routeTransactionOperations={current_transaction_operations}
                  routeTransactionOperationDescriptions={current_transaction_operation_descriptions}
                  />
              );
            })};
            <Text>HA</Text>
          </ScrollView>
          :
          <View style={tw`h-full flex flex-col items-center justify-center`}>
            <Text style={tw`text-xl font-bold mb-20`}>Aún no hay ventas realizadas para esta tienda</Text>
          </View>
        }
        <View style={tw`h-32`}/>
    </View>
  );
};

export default StoreMenuLayout;
