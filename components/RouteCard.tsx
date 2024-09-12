import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';
import { IRoute, IRouteDay } from '../interfaces/interfaces';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';

import {
    setDayInformation,
    setRouteInformation,
    setRouteDay,
  } from '../redux/slices/routeDaySlice';


const RouteCard = (
  {navigation, goTo, 
    // routeName, day, description, route, routeDay

  }:
  {
    navigation:any,
    goTo:string,
    // routeName:string,
    // day:string,
    // description:string|undefined,
    // route:IRoute,
    // routeDay:IRouteDay
  }) => {

  // Use AppDispatch from store.ts to type the dispatch
  const dispatch: AppDispatch = useDispatch();

    return (
      <View style={
        tw`my-2 bg-blue-500 rounded w-11/12 h-16 
        flex flex-row justify-center items-center text-white`}>
        <View style={tw`flex basis-1/5 flex-col`}>
          <Text style={tw`text-white text-lg text-center`}>1</Text>
        </View>
        <View style={tw`flex basis-2/5 flex-col justify-center`}>
          <Text style={tw`text-white text-xl`}>Paco's shop</Text>
          <Text style={tw`text-white text-xs`}>Mariano Otero #1254, Atemajac del Valle</Text>
        </View>
        <View style={tw`flex basis-1/5 flex-col justify-center`}>
          <Text style={tw`text-white text-lg`}>
            $100
          </Text>
        </View>
        <View style={tw`w-full flex basis-1/5 flex-row justify-center`}>
          {/* <View style={tw`flex flex-row justify-center w-full`}> */}
            <Pressable
            style={tw`
              bg-blue-700 py-4 rounded-full 
              flex basis-4/5 flex-row justify-center items-center`}
            onPress={() => {
              navigation.navigate(goTo);
              }}>
              <Icon name="chevron-right" style={tw`text-base text-center`} color="#fff" />
            </Pressable>
          {/* </View> */}
        </View>
      </View>
    );
  };

export default RouteCard;
