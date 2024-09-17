// Libraries
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';

// Utils
import { IRoute, ICompleteRouteDay } from '../interfaces/interfaces';

const Card = ({
    routeName,
    day,
    description,
    onSelectCard,
    route,
    routeDay,
  }:{
    routeName:string,
    day:string,
    description:string|undefined,
    onSelectCard:any,
    route:IRoute,
    routeDay:ICompleteRouteDay,
  }) => {
    return (
      <View style={
        tw`my-2 bg-blue-500 rounded w-11/12 h-16 
          flex flex-row justify-center items-center text-white`
        }>
        <View style={tw`flex basis-1/4 flex-col justify-center`}>
          <Text style={tw`text-white text-xl `}>{routeName}</Text>
          <Text style={tw`text-white text-xl`}>{day}</Text>
        </View>
        <Text style={tw`text-white text-base flex basis-2/4`}>
          {description}
        </Text>
        <Pressable
        style={tw`bg-blue-700 px-4 py-3 rounded-full flex flex-row justify-center`}
        onPress={() => { onSelectCard(route, routeDay); }}>
          <Icon name="chevron-right" style={tw`text-base text-center`} color="#fff" />
        </Pressable>
      </View>
    );
  };

export default Card;
