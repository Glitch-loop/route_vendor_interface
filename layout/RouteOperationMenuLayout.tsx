// Libraries
import React from 'react';
import { Text } from 'react-native-paper';
import tw from 'twrnc';

// Redux context
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ScrollView, View } from 'react-native';

// Components
import RouteCard from '../components/RouteCard';
import TypeOperationItem from '../components/TypeOperationItem';

const RouteOperationMenuLayout = ({ navigation }:{ navigation:any }) => {
  // Redux (context definitions)
  const dayOperations = useSelector((state: RootState) => state.dayOperations);
  const routeDay = useSelector((state: RootState) => state.routeDay);


  return (
    <ScrollView style={tw`w-full h-full flex flex-col`}>
      <Text style={tw`w-full ml-3 text-4xl`}>{routeDay.route_name}</Text>
      <View style={tw`w-full flex flex-row justify-center`}>
        <View style={tw`w-11/12 flex flex-row justify-start`}>
          <TypeOperationItem />
        </View>
      </View>
      <View style={tw`w-full h-full flex flex-col items-center`}>
        {dayOperations.map(dayOperation => {
          return (
                <RouteCard
                key={dayOperation.id_item}
                navigation={navigation}
                goTo=''
                />
          );
        })}
      </View>
    </ScrollView>
  );
};

export default RouteOperationMenuLayout;

