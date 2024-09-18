// Libraries
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';

// Interfaces
import { IDayOperation, IStore } from '../../interfaces/interfaces';

// Redux context
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

// Components
import GoButton from '../generalComponents/GoButton';

// Auxiliar function
function getNameOfTheStore(currentOperation:IDayOperation, stores:IStore[]):string {
  const foundStore:IStore|undefined = stores
    .find(store => store.id_store === currentOperation.id_item);

  if(foundStore === undefined) {
    return '';
  } else {
    return foundStore.store_name;
  }
}

const StoreHeader = ({onGoBack}:{onGoBack:any}) => {
  // Redux (context definitions)
  const currentOperation = useSelector((state: RootState) => state.currentOperation);
  const stores = useSelector((state: RootState) => state.stores);


  return (
    <View style={tw`w-full text-center flex flex-row justify-start items-center`}>
      <GoButton
        iconName={'chevron-left'}
        onPressButton={onGoBack}/>
      <Text style={tw`ml-3 text-3xl text-black`}> { getNameOfTheStore(currentOperation, stores) } </Text>
    </View>
  );
};

export default StoreHeader;
