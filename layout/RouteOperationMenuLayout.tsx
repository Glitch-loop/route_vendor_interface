// Libraries
import React, { useState } from 'react';
import { Text } from 'react-native-paper';
import tw from 'twrnc';

// Redux context
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ScrollView, View, Pressable } from 'react-native';

// Components
import RouteCard from '../components/RouteCard';
import TypeOperationItem from '../components/TypeOperationItem';


const RouteOperationMenuLayout = ({ navigation }:{ navigation:any }) => {
  // Redux (context definitions)
  const dayOperations = useSelector((state: RootState) => state.dayOperations);
  const routeDay = useSelector((state: RootState) => state.routeDay);
  const stores = useSelector((state: RootState) => state.stores);

  return (
    <View style={tw`flex-1`}>
      <ScrollView
      style={tw`w-full h-full flex flex-col`}
      scrollEventThrottle={16}
      >
        <Text style={tw`w-full ml-3 text-4xl`}>{routeDay.route_name}</Text>
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
            const index = stores.findIndex(store => store.id_store === dayOperation.id_item);

            if (index === -1) {
              // It means the day operation is not a client of the route.
              if (dayOperation.id_type_operation === '5361d05b-e291-4fce-aa70-9452d7cfcadd'){
                itemName = 'Inventario de inicio de ruta';
                style = 'my-2 bg-red-300 rounded w-11/12 h-16 flex flex-row justify-center items-center text-white';
                // It is a "start shift inventory"
              } else if (dayOperation.id_type_operation === '37bb2bb6-f8a1-4df9-8318-6fb9831aae49') {
                // It is a "restock inventory"
                itemName = 'Restock de producto';
              } else if (dayOperation.id_type_operation === 'b94e615c-9899-4e82-99f1-979d773b8341') {
                // It is a "end shift inventory"
                itemName = 'Inventario de fin de ruta';
              }
            } else {
              // It means it is a client is not a client of the route.
              itemOrder = dayOperation.operation_order.toString();
              itemName = stores[index].store_name!;
              description = stores[index].street + ' #' + stores[index].ext_number + ', ' + stores[index].colony;
              totalValue = '10';
              style = 'my-2 bg-amber-300 rounded w-11/12 h-16 flex flex-row justify-center items-center text-white';
            }

            return (
              <RouteCard
              key={dayOperation.id_item}
              navigation={navigation}
              goTo=''
              style={style}
              itemOrder={itemOrder}
              itemName={itemName}
              description={description}
              totalValue={totalValue}
              />);
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
              style={tw`bg-orange-500 px-4 py-3 mx-1 rounded flex flex-row basis-1/3 justify-center`}>
              <Text style={tw`text-sm text-center`}>Restock de producto</Text>
            </Pressable>
            <Pressable
              style={tw`bg-indigo-400 px-4 py-3 rounded flex flex-row basis-1/3 justify-center`}>
              <Text style={tw`text-sm text-center`}>Finalizar ruta</Text>
            </Pressable>
        </View>
    </View>
  );
};

export default RouteOperationMenuLayout;

