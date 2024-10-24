// Libraries
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';

// Interfaces
import { IDayOperation, IStore, IStoreStatusDay } from '../../interfaces/interfaces';

// Redux context
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

// Components
import GoButton from '../generalComponents/GoButton';
import BluetoothButton from '../generalComponents/BluetoothButton';
import { getColorContextOfStore } from '../../utils/routesFunctions';

// Auxiliar function
function getNameOfTheStore(currentOperation:IDayOperation, stores:(IStore&IStoreStatusDay)[]):IStore&IStoreStatusDay {
  const emptyStore:IStore&IStoreStatusDay = {
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
    route_day_state: 0,
  };

  const foundStore: (IStore & IStoreStatusDay) |undefined = stores
    .find(store => store.id_store === currentOperation.id_item);

  if(foundStore === undefined) {
    return emptyStore;
  } else {
    return foundStore;
  }
}

const StoreHeader = ({
    onGoBack,
  }:{
    onGoBack:any
  }) => {
  // Redux (context definitions)
  const currentOperation = useSelector((state: RootState) => state.currentOperation);
  const routeDay = useSelector((state: RootState) => state.routeDay);
  const stores = useSelector((state: RootState) => state.stores);


  const [store, setStore] = useState<IStore&IStoreStatusDay>(getNameOfTheStore(currentOperation, stores));

  return (
    <View style={tw`w-full flex flex-row`}>
      <View style={tw`flex flex-row basis-2/3 items-center`}>
        <GoButton
          iconName={'chevron-left'}
          onPressButton={onGoBack}/>
        <Text style={tw`text-3xl text-black`}>{routeDay.route_name}</Text>
        <Text style={tw`text-2xl text-black mx-1`}>|</Text>
        <Text style={tw`ml-3 text-3xl text-black text-center align-middle`}>
          { store.store_name }
        </Text>
        <View style={tw`${ getColorContextOfStore(store, currentOperation) }`} />
      </View>
      <View style={tw`flex flex-row basis-1/3 justify-center`}>
        <BluetoothButton
        iconName={'print'}
        onPressButton={() => {}}/>
      </View>
    </View>
  );
};

export default StoreHeader;
