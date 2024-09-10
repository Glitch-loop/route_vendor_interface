import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';
import { standard_format } from '../utils/moment_format';
import DAYS from '../lib/days';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';


const RouteHeader = ({navigation, goTo}:{navigation:any, goTo:string}) => {
  // Redux (context definitions)
  const routeDay = useSelector((state: RootState) => state.routeDay);

  return (
    <View style={tw`w-full flex flex-row justify-around text-center items-center`}>
      <Pressable
        style={tw`bg-blue-700 px-4 py-3 rounded-full flex flex-row justify-center`}
        onPress={() => navigation.navigate(goTo)}>
        <Icon name="chevron-left" style={tw`text-base text-center`} color="#fff" />
      </Pressable>
      <Text style={tw`text-3xl text-black`}>{routeDay.route_name}</Text>
      <Text style={tw`text-2xl text-black`}>|</Text>
      <View style={tw`flex flex-col`}>
        <Text style={tw`text-base text-black text-center`}>{standard_format()}</Text>
        <Text style={tw`text-base text-black text-center`}>{DAYS[routeDay.id_day].day_name}</Text>
      </View>
    </View>
  );
};

export default RouteHeader;
