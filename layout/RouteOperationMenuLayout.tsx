// Libraries
import React, { useEffect } from 'react';
import { BackHandler, ScrollView, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import tw from 'twrnc';

// Interfaces and enums
import { IDayOperation } from '../interfaces/interfaces';

// Redux context
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { setCurrentOperation } from '../redux/slices/currentOperationSlice';

// Components
import RouteCard from '../components/RouteCard';
import MenuHeader from '../components/generalComponents/MenuHeader';
import TypeOperationItem from '../components/TypeOperationItem';

// Utils
import { getColorContextOfStore } from '../utils/routesFunctions';
import DAYS_OPERATIONS from '../lib/day_operations';

const RouteOperationMenuLayout = ({ navigation }:{ navigation:any }) => {
  // Redux (context definitions)
  const dispatch:AppDispatch = useDispatch();
  const dayOperations = useSelector((state: RootState) => state.dayOperations);
  const routeDay = useSelector((state: RootState) => state.routeDay);
  const stores = useSelector((state: RootState) => state.stores);

  useEffect(() => {
    // navigation.reset({
    //   index: 0,
    //   routes: [{name: 'routeOperationMenu'}],
    // });

    const backAction = () => {
      /*
        In this particular case, the "back handler" of the phone should not do anything.
        This because the "route store" becomes the new main menu of the vendor.

        This will be true until the user finishes the route of the day.
      */
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();

  }, []);

  // Handlers
  const onSelectStore = (dayOperation: IDayOperation):void => {
    dispatch(setCurrentOperation(dayOperation));
    navigation.navigate('storeMenu');
  };

  const onSelectInventoryOperation = (dayOperation: IDayOperation):void => {
    dispatch(setCurrentOperation(dayOperation));
    navigation.navigate('inventoryOperation');
  };

  const onRestockInventory = ():void => {
    dispatch(setCurrentOperation({
      id_day_operation: routeDay.id_route_day, // Specifying that this operation belongs to this day.
      id_item: '', // It is still not an operation.
      id_type_operation: DAYS_OPERATIONS.restock_inventory,
      operation_order: 0,
      current_operation: 0,
    }));
    navigation.navigate('inventoryOperation');
  };

  const onFinishInventory = ():void => {
    dispatch(setCurrentOperation({
      id_day_operation: routeDay.id_route_day, // Specifying that this operation belongs to this day.
      id_item: '', // It is still not an operation.
      id_type_operation: DAYS_OPERATIONS.end_shift_inventory,
      operation_order: 0,
      current_operation: 0,
    }));
    navigation.navigate('inventoryOperation');
  };

  return (
    <View style={tw`flex-1`}>
      <ScrollView
        style={tw`w-full h-full flex flex-col`}
        scrollEventThrottle={16}>
        <View style={tw`my-5`}>
          <MenuHeader
            showGoBackButton={false}
            showStoreName={false}
            showPrinterButton={true}
            onGoBack={() => {}}/>
        </View>
        {/* <Text style={tw`w-full ml-3 my-3 text-4xl`}>{routeDay.route_name}</Text> */}
        <View style={tw`w-full flex flex-row justify-center`}>
          <View style={tw`w-11/12 flex flex-row justify-start`}>
            <TypeOperationItem />
          </View>
        </View>
        <View style={tw`w-full h-full flex flex-col items-center`}>
          {dayOperations.map(dayOperation => {
            let itemOrder = '';
            let itemName = '';
            let description = '';
            let totalValue = '';
            let style = '';
            let typeOperation = true; /*true = client, false = inventory operation*/
            const index = stores.findIndex(store => store.id_store === dayOperation.id_item);
            if (index === -1) {
              /* If an index was not found, it means that the operation is not related to a client. */

              // Style for inventory operation card
              style = 'my-2 bg-red-300 rounded w-11/12 h-16 flex flex-row justify-center items-center text-white';

              // Determining the type of inventory operation
              if (dayOperation.id_type_operation === '5361d05b-e291-4fce-aa70-9452d7cfcadd'){
                itemName = 'Inventario de inicio de ruta';
                // It is a "start shift inventory"
              } else if (dayOperation.id_type_operation === '37bb2bb6-f8a1-4df9-8318-6fb9831aae49') {
                // It is a "restock inventory"
                itemName = 'Restock de producto';
              } else if (dayOperation.id_type_operation === 'b94e615c-9899-4e82-99f1-979d773b8341') {
                // It is a "end shift inventory"
                itemName = 'Inventario de fin de ruta';
              }
              typeOperation = false;
            } else {
              // It means that the operation is related with a client
              itemOrder = dayOperation.operation_order.toString();
              itemName = stores[index].store_name!;
              description = stores[index].street + ' #' + stores[index].ext_number + ', ' + stores[index].colony;
              totalValue = '10';
              style = `my-2 ${ getColorContextOfStore(stores[index], dayOperation) } rounded w-11/12 h-16 flex flex-row justify-center items-center text-white`;
              typeOperation = true;
            }

            return (
              <RouteCard
                key={dayOperation.id_item}
                itemOrder={itemOrder}
                itemName={itemName}
                description={description}
                totalValue={totalValue}
                style={style}
                onSelectItem={ typeOperation ?
                  () => { onSelectStore(dayOperation); } :
                  () => { onSelectInventoryOperation(dayOperation); }}/>
              );
          })}
        </View>
        <View style={tw`h-32`}/>
      </ScrollView>
        <View style={tw`w-full
          absolute mb-3 bottom-0 left-0 right-0 bg-amber-300 p-4
          flex flex-row justify-around
          `}>
            <Pressable
              style={tw`bg-green-500 px-4 py-3 rounded flex flex-row basis-1/3 justify-center`}>
              <Text style={tw`text-sm text-center`}>Crear nuevo cliente</Text>
            </Pressable>
            <Pressable
              onPress={() => { onRestockInventory(); }}
              style={tw`bg-orange-500 px-4 py-3 mx-1 rounded flex flex-row basis-1/3 justify-center`}>
              <Text style={tw`text-sm text-center`}>Restock de producto</Text>
            </Pressable>
            <Pressable
              onPress={() => { onFinishInventory(); }}
              style={tw`bg-indigo-400 px-4 py-3 rounded flex flex-row basis-1/3 justify-center`}>
              <Text style={tw`text-sm text-center`}>Finalizar ruta</Text>
            </Pressable>
        </View>
    </View>
  );
};

export default RouteOperationMenuLayout;

