// Libraries
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';

// Services
import {
  getPrinterConnectionStatus,
  getBluetoothPrinterConnection,
  disconnectPrinter,
} from '../../services/printerService';
import ActionDialog from '../ActionDialog';

const BluetoothButton = ({}:{}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isBeingConnected, setIsBeingConnected] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const [renderingComponent, setRenderingComponent] = useState<boolean>(true);

  useEffect(() => {
    const intervalAction = setInterval(async () => {
      setRenderingComponent(false);
      setIsConnected(await getPrinterConnectionStatus());
    }, 10000);

    /* Clear action when unmount */
    // return () => clearInterval(intervalAction);
  }, []);

  useEffect(() => {
    if (isBeingConnected) {
      getBluetoothPrinterConnection()
      .then((result:boolean) => {
        setIsBeingConnected(false);
        setIsConnected(result);
      })
      .catch(() => {
        /* Somthing was wrong during printer connection*/
        setIsBeingConnected(false);
        setIsConnected(false);
      });
    }
  }, [isBeingConnected]);

  const handlerConnectPrinter = async () => {
    if (isBeingConnected === false){ // Avoiding multiple click from the user
      if (await getPrinterConnectionStatus()) {
        /* Maybe the user wants to disconnect the printer from the device */
        setIsConnected(true);
        setShowDialog(true);
      } else {
        /* Beginning process for printer connection */
        setIsBeingConnected(true);
        setIsConnected(false);
      }
    } else {
      /* User cannot start a connection process more than once. */
    }
  };

  const handlerCancelDisconnectDevice = () => {
    setShowDialog(false);
  };

  const handlerDisconnectPrinter = async () => {
    await disconnectPrinter();
    setIsConnected(false);
    setShowDialog(false);
  };

  return (
    <View>
        <ActionDialog
          visible={showDialog}
          onAcceptDialog={handlerDisconnectPrinter}
          onDeclinedialog={handlerCancelDisconnectDevice}>
          <Text>
            ¿Quieres desconetar el dispositivo de la impresora?
          </Text>
        </ActionDialog>
      <Pressable
        style={tw`bg-blue-700 py-6 px-6 rounded-full`}
        onPress={handlerConnectPrinter}>
        <Icon name={'print'}
          style={tw`absolute inset-0 top-3 text-base text-center`} color="#fff" />
      </Pressable>
      { isBeingConnected || renderingComponent ?
        <ActivityIndicator style={tw`absolute top-0 right-8`}/> :
        <View
          style={tw`absolute top-0 right-8 ${isConnected ? 'bg-green-500' : 'bg-red-700'} py-3 px-3 
          rounded-full`}/>
      }
    </View>
  );
};

export default BluetoothButton;
