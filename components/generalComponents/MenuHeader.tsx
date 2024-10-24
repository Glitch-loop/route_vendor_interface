// Libraries
import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

// Interfaces
import { IStore, IStoreStatusDay } from '../../interfaces/interfaces';

// Redux context
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

// Components
import GoButton from '../generalComponents/GoButton';
import BluetoothButton from '../generalComponents/BluetoothButton';
import { getColorContextOfStore, getStoreFromContext } from '../../utils/routesFunctions';

// Auxiliar function


function getJustifyContentConfiguration(showGoBackButton:boolean, showRouteName:boolean, showStoreName:boolean, showPrinterButton:boolean):string {
  let justifyConent = 'justify-around w-full';
  let activeFields = 0;

  if (showGoBackButton) {
    activeFields += 1;
  }

  if (showRouteName) {
    activeFields += 1;
  }

  if (showStoreName) {
    activeFields += 1;
  }

  if (showPrinterButton) {
    activeFields += 1;
  }

  if (activeFields > 1) { // There are more than 1 actived fields
    justifyConent = 'justify-around w-full';
  } else { // There are only 1 field active
    if (showPrinterButton === true) {
      /* Printer button is the only one that is active. */
      justifyConent = 'justify-end mr-3';
    } else {
      /* There is only one item active, and it is not the printer button. */
      justifyConent = 'justify-start ml-3';
    }

  }

  return justifyConent;
}

const MenuHeader = ({
    showGoBackButton = true,
    showRouteName = true,
    showStoreName = true,
    showPrinterButton = true,
    onGoBack,
  }:{
    showGoBackButton?:boolean,
    showRouteName?:boolean,
    showStoreName?:boolean,
    showPrinterButton?:boolean,
    onGoBack:any
  }) => {
  // Redux (context definitions)
  const currentOperation = useSelector((state: RootState) => state.currentOperation);
  const routeDay = useSelector((state: RootState) => state.routeDay);
  const stores = useSelector((state: RootState) => state.stores);


  // Read-only variables
  let store:IStore&IStoreStatusDay = getStoreFromContext(currentOperation, stores);

  return (
    <View style={tw`flex flex-row items-center ${getJustifyContentConfiguration(showGoBackButton,
      showRouteName, showStoreName, showPrinterButton)}`}>
      { showGoBackButton &&
        <View style={tw`ml-0`}>
          <GoButton
            iconName={'chevron-left'}
            onPressButton={onGoBack}/>
        </View>
      }
      { showRouteName &&
        <Text style={tw`text-3xl text-black text-center align-middle`}> { routeDay.route_name } </Text>
      }
      { showRouteName && showStoreName &&
        <Text style={tw`text-2xl text-black text-center align-middle`}>|</Text>
      }
      { showStoreName &&
        <Text style={tw`max-w-25 ml-3 text-lg text-black text-center align-middle`}> { store.store_name } </Text>
      }
      { showStoreName &&
        <View style={tw`${ getColorContextOfStore(store, currentOperation) } rounded-full flex flex-row h-6 w-6`} />
      }
      { showPrinterButton &&
        <View style={tw`mr-0`}>
          <BluetoothButton />
        </View>
      }
    </View>
  );
};

export default MenuHeader;
