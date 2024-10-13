//import ThermalPrinterModule from 'react-native-thermal-printer';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';

// import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';

let connectedPritner:BluetoothDevice|undefined;

export async function getPrinterBluetoothConnction() {
  try {
    if (connectedPritner === undefined) { // It means that there is not a printer connected.
      // Verifying if there is enabled to use bluetooh in the application.
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();

      if (!enabled) { // In case of not have the permission, then ask for them.
        await RNBluetoothClassic.requestBluetoothEnabled();
        console.log('You have to enable the permissions');
      } else {
        console.log("Discovering new devices")
        const foundDevices = await RNBluetoothClassic.startDiscovery(); // Searching for possibles printers to connect

        // From the found devices get the devices that are the printers.
        const candidatePrinters = foundDevices.filter((device) => {
          if(device.deviceClass !== undefined) {
            /*
            According with bluetooth official webpage (Bluetooth Core Specification ), the codes that are specifically
            used for printers are (https://www.bluetooth.com/specifications/assigned-numbers/):
                deviceClass: 1664 (printers)
                majorClass:  1536 (imaging category)
            */
            if (device.deviceClass.deviceClass! === 1664 && device.deviceClass.majorClass! === 1536) {
              return device;
            }
          }
        });

        // Requesting pairing to a printer.
        for (const candidatePrinter of candidatePrinters) {
          const connected = await RNBluetoothClassic.connectToDevice(candidatePrinter.address);
          if (await connected.isConnected() === true) {
            connectedPritner = connected;
            break; // It was found a device.
          } else {
            /* Do nothing */
            /* Following with the next option */
          }
        }

        if (connectedPritner === undefined) {
          console.log('There were not printers found.');
          connectedPritner = undefined;
        } else {
            console.log('Successfully connected to printer');
        }
      }

    } else { // It means that there is a printer connected
      /* Do nothing */
    }
  } catch (error) {
    console.error('Something was wrong during printer connection: ', connectedPritner);
  }
}

export async function printTicketBluetooth(messageToPrint:string)  {
  try {
    if (connectedPritner !== undefined) {
      if (await connectedPritner.isConnected() === true) {
        //Example of sending data to the printer
        await RNBluetoothClassic.writeToDevice(
          connectedPritner.address,
          messageToPrint);
      } else {
        connectedPritner = undefined;
        console.error('Printer is not connected');
        throw Error;
      }
    } else {
      connectedPritner = undefined;
      console.error('Printer is not connected');
      throw Error;
    }

  } catch (err) {
    console.error('Printing error: ', err);
    throw Error;
  }
}
