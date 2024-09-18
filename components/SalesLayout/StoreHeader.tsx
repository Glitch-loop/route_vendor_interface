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
      <Pressable
        style={tw`bg-blue-700 px-3 py-2 rounded-full flex flex-row justify-center items-center`}
        onPress={() => onGoBack()}>
        <Icon name="chevron-left" style={tw`text-base text-center`} color="#fff" />
      </Pressable>
      <Text style={tw`text-3xl text-black`}> { getNameOfTheStore(currentOperation, stores) } </Text>
    </View>
  );
};

export default StoreHeader;
