// Libraries
//import ThermalPrinterModule from 'react-native-thermal-printer';
import { Alert } from 'react-native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import Toast from 'react-native-toast-message';

let connectedPritner:BluetoothDevice|undefined;
const deviceClassCode: number = 1664;
const majorClassCode: number = 1536;

export async function getBluetoothPermissionStatus():Promise<boolean> {
  return await RNBluetoothClassic.isBluetoothEnabled();
}

export async function getPrinterConnectionStatus():Promise<boolean> {
  let statusConnection = false;
  let connectedDevices:BluetoothDevice[]
    = await RNBluetoothClassic.getConnectedDevices();

  for (let i = 0; i < connectedDevices.length; i++) {
    if (connectedDevices[i].deviceClass !== undefined) {
      const {deviceClass, majorClass} = connectedDevices[i].deviceClass;
      if(deviceClass === deviceClassCode && majorClassCode === majorClass) {
        statusConnection = true;
        connectedPritner = connectedDevices[i];
      }
    }
  }

  return statusConnection;
}

export async function requestBluetoothPermissions():Promise<boolean> {
  try {
    if (await RNBluetoothClassic.requestBluetoothEnabled()) {
      return true;
    } else {
      Toast.show({type: 'info', text1:'Permisos requeridos',
        text2: 'Para poder conectar una impresora via bluetooth tienes que otorgar este permiso'});
      return false;
    }
  } catch (error) {
    Toast.show({type: 'error', text1:'Error al pedir permisos',
      text2: 'Algo salio mal. Intenta nuevamente.'});
    return false;
  }
}

export async function getBluetoothPrinterConnection():Promise<boolean> {
  try {
    let connectionResult:boolean = false;
    if (await getPrinterConnectionStatus()) {
      // There is already a printer connected.
      connectionResult = true;
    } else {
      // There is not a printer conencted.
      if (await getBluetoothPermissionStatus()) {
        Toast.show({type: 'info', text1:'Buscando impresoras',
          text2: 'Buscando impresoras. Esto puede tomar un par de segundos.',
        });
        // Application has the required permissons.

        // Searching for possibles printers to connect
        const foundDevices = await RNBluetoothClassic.startDiscovery();

        // From the found devices get the devices that are the printers.
        const candidatePrinters = foundDevices.filter((device) => {
          if(device.deviceClass !== undefined) {
            /*
            According with bluetooth official webpage (Bluetooth Core Specification ), the codes that are specifically
            used for printers are (https://www.bluetooth.com/specifications/assigned-numbers/):
                deviceClass: 1664 (printers)
                majorClass:  1536 (imaging category)
            */
            const {deviceClass, majorClass} = device.deviceClass;

            if (deviceClass === deviceClassCode && majorClass === majorClassCode) {
              return device;
            } else {
              /* Do nothing */
            }
          }
        });

        // Requesting pairing to a printer.
        for (const candidatePrinter of candidatePrinters) {
          const connected
          = await RNBluetoothClassic.connectToDevice(candidatePrinter.address);

          if (await connected.isConnected() === true) {
            connectedPritner = connected;
            break; // It was found a device.
          } else {
            /* Do nothing: Follow to the next option */
          }
        }

        if (connectedPritner === undefined) {
          Toast.show({type: 'error', text1:'No se encontraron impresoras para conectarse',
              text2: 'No se ha encontrado ninguna impresora.'});
          connectedPritner = undefined;
          connectionResult = false;
        } else {
          Toast.show({type: 'success',
            text1:'Impresora conectada satisfactoriamente.',
            text2: 'Se ha conectado la impresora satisfactoriamente'});
          connectionResult = true;
        }

        // Desactivating searching mode of bluetooth
        await RNBluetoothClassic.cancelDiscovery();
      } else {
        // Application doesn't have the necessary permissions.
        if (await requestBluetoothPermissions()) {
          // If user granted the permissions, try one more time the process for connection.
          getBluetoothPrinterConnection();
        } else {
          // Finish the process.
          Toast.show({type: 'error',
            text1:'No se ha podido establecer conexión con la impresora',
            text2: 'No se ha podido establecer conexión a falta de permisos. Intenté nuevamente.'});
          connectionResult = false;
        }
      }
    }

    return connectionResult;
  } catch(error) {
    Toast.show({type: 'error', text1:'Error', text2: 'Algo salio mal. Intenta nuevamente.'});

    return false;
  }
}

export async function disconnectPrinter() {
  if (await getPrinterConnectionStatus() && connectedPritner !== undefined) {
    /* There is a printer connected */
    RNBluetoothClassic.disconnectFromDevice(connectedPritner.address);
  } else {
    /* Do nothing: There is not a printer connected */
  }
}

export async function printTicketBluetooth(messageToPrint:string)  {
  try {
    if (connectedPritner !== undefined) {
      if (await getPrinterConnectionStatus()) {
        //Example of sending data to the printer
        await RNBluetoothClassic.writeToDevice(
          connectedPritner.address,
          messageToPrint);
      } else {
        Toast.show({type: 'error',
          text1:'Sin conexión con la impresora.',
          text2: 'No se ha detectado la impresora, intente nuevamente.'});
      }
    } else {
      connectedPritner = undefined;
      Toast.show({type: 'error',
        text1:'Sin conexión con la impresora.',
        text2: 'No se ha detectado la impresora, intente nuevamente.'});
    }
  } catch (error) {
    Toast.show({type: 'error',
      text1:'Sin conexión con la impresora.',
      text2: 'No se ha detectado la impresora, intente nuevamente.'});
  }
}
