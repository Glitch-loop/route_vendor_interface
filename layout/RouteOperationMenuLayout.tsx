// Libraries
import React from 'react';
import { Text } from 'react-native-paper';

// Redux context
import { useSelector } from 'react-redux';
import { RootState,  } from '../redux/store';
import { ScrollView } from 'react-native';

const RouteOperationMenuLayout = () => {
  // Redux (context definitions)
  const dayOperation = useSelector((state: RootState) => state.dayOperations);
  return (
    <ScrollView>
      <Text>{dayOperation.length}</Text>
    </ScrollView>

  );
};

export default RouteOperationMenuLayout;

