// Libraries
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';

// Components
import RouteMap from '../components/RouteMap';

// Redux context
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { clearCurrentOperation } from '../redux/slices/currentOperationSlice';
import { IStore, IStoreStatusDay } from '../interfaces/interfaces';

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
}

function getStoreFromContext(idStore:string, stores:(IStore&IStoreStatusDay)[]) {
  const foundStore:IStore&IStoreStatusDay|undefined = stores
  .find(store => { store.id_store === idStore; });

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
    address = address + '#' + store.ext_number + ' ';
  }

  if (store.colony !== ''){
    address = address + ',' + store.colony;
  }

  return address;
}

const StoreMenuLayout = ({ navigation }:{ navigation:any}) => {

  //Defining redux context
  const dispatch: AppDispatch = useDispatch();
  const currentOperation = useSelector((state: RootState) => state.currentOperation);
  const stores = useSelector((state: RootState) => state.stores);

  // Defining state
  const [store, setStore] =
    useState<IStore&IStoreStatusDay>(getStoreFromContext(currentOperation.id_item, stores));

  // handlres
  const onGoBackToMainOperationMenu = () => {
    clearCurrentOperation();
    navigation.navigate('routeOperationMenu');

  }

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <View style={tw`w-full flex my-5 flex-row justify-around items-center`}>
        <Pressable
          style={tw`bg-blue-700 px-4 py-3 rounded-full flex flex-row justify-center`}
          onPress={onGoBackToMainOperationMenu}>
          <Icon name="chevron-left" style={tw`text-base text-center`} color="#fff" />
        </Pressable>
        <Text style={tw`text-3xl`}>Ruta 1</Text>
        <Text style={tw`text-2xl mx-1`}>|</Text>
        <Text style={tw`text-xl max-w-1/2`}>{store.store_name}</Text>
        <View style={tw`flex flex-row h-6 w-6 bg-indigo-500 rounded-full`} />
      </View>
      <View style={tw`h-1/2 w-11/12 flex-1 border-solid border-2 rounded-sm`}>
        <RouteMap />
      </View>
      <View style={tw`flex-1 w-11/12 flex-col`}>
        <View style={tw`flex flex-row basis-1/3 justify-around items-center`}>
          <View style={tw`flex flex-col basis-1/2 justify-around`}>
            <Text style={tw`text-black text-xl`}>Dirección</Text>
            <Text style={tw`text-black`}>{buildAddress(store)}</Text>
          </View>
          <View style={tw`flex flex-col basis-1/2 justify-around`}>
            <Text style={[tw`text-black text-xl`, { lineHeight: 20! }]}>Información del cliente</Text>
            <Text style={tw`text-black`}>{store.owner_name} | {store.cellphone}</Text>
          </View>
        </View>
        <View style={tw`flex flex-col basis-1/3 justify-center`}>
          <Text style={tw`text-black text-xl`}>Referencia</Text>
          <Text style={tw`text-black`}>{store.address_reference}</Text>
        </View>
        <View style={tw`h-3/5 h-1/2 flex flex-row basis-1/3 justify-around items-center`}>
          <View style={tw`h-1/2 flex basis-1/2 justify-center items-center`}>
            <Pressable style={tw`w-11/12 h-full border-solid border bg-blue-500 
              rounded flex flex-row justify-center items-center`}>
              <Text style={tw`text-center text-black`}>Transacciones de hoy</Text>
            </Pressable>
          </View>
          <View style={tw`h-1/2 flex basis-1/2 justify-center items-center`}>
            <Pressable style={tw`h-full w-11/12 bg-green-500 rounded border-solid border
              flex flex-row justify-center  items-center`}>
              <Text style={tw`text-center text-black`}>Iniciar venta</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default StoreMenuLayout;
