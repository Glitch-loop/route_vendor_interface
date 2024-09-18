// Libraries
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';

// Interface and enums
import { enumStoreStates } from '../interfaces/enumStoreStates';

// Components
import RouteMap from '../components/RouteMap';

// Redux context
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { clearCurrentOperation } from '../redux/slices/currentOperationSlice';
import { IDayOperation, IStore, IStoreStatusDay } from '../interfaces/interfaces';
import GoButton from '../components/generalComponents/GoButton';

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
  new_client: false,
  special_sale: false,
  visited: false,
  petition_to_visit: false,
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
    if (store.routeDaystate === enumStoreStates.NEW_CLIENT) {
      style = 'flex flex-row h-6 w-6 bg-green-400 rounded-full';
    } else if (store.routeDaystate === enumStoreStates.SPECIAL_SALE) {
      style = 'flex flex-row h-6 w-6 bg-green-600 rounded-full';
    } else if (store.routeDaystate === enumStoreStates.REQUEST_FOR_SELLING) {
      style = 'flex flex-row h-6 w-6 bg-amber-500 rounded-full';
    } else if (store.routeDaystate === enumStoreStates.SERVED) {
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

  useEffect(() => {
    setStore(getStoreFromContext(currentOperation.id_item, stores));
  },[currentOperation]);

  // handlres
  const handlerGoBackToMainOperationMenu = () => {
    dispatch(clearCurrentOperation());
    navigation.navigate('routeOperationMenu');
  };

  const handlerOnStartSale = () => {
    navigation.navigate('sales');
  };



  return (
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
            <Text style={[tw`text-black text-xl`, { lineHeight: 20! }]}>Información del cliente</Text>
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
            <Pressable style={tw`w-11/12 h-full border-solid border bg-blue-500 
              rounded flex flex-row justify-center items-center`}>
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
    </View>
  );
};

export default StoreMenuLayout;
