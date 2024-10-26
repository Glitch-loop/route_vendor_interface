// Libraries
import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

// Utils
import { timesamp_standard_format } from '../utils/momentFormat';
import DAYS from '../lib/days';
import { capitalizeFirstLetter } from '../utils/generalFunctions';

// Redux context
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

// Components
import GoButton from './generalComponents/GoButton';
import BluetoothButton from './generalComponents/BluetoothButton';

const RouteHeader = ({onGoBack}:{onGoBack:any}) => {
  // Redux (context definitions)
  const routeDay = useSelector((state: RootState) => state.routeDay);

  return (
    <View style={tw`w-full flex flex-row justify-around text-center items-center`}>
      <GoButton
        iconName={'chevron-left'}
        onPressButton={onGoBack}/>
      <Text style={tw`text-3xl text-black`}>{routeDay.route_name}</Text>
      <Text style={tw`text-2xl text-black`}>|</Text>
      <View style={tw`flex flex-col`}>
        <Text style={tw`text-base text-black text-center`}>
          {capitalizeFirstLetter(timesamp_standard_format())}
        </Text>
        <Text style={tw`text-base text-black text-center`}>{DAYS[routeDay.id_day].day_name}</Text>
      </View>
      <BluetoothButton />
    </View>
  );
};

export default RouteHeader;
