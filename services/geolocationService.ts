// Libraries
import { PermissionsAndroid, Platform, Alert, BackHandler } from 'react-native';

// Services
import Geolocation from 'react-native-geolocation-service';

// Interfaces
import { ICoordinates } from '../interfaces/interfaces';


// Request location permission for Android (iOS handles this automatically with the plist)
export async function requestGeolocationPermission () {
  let grantedPermission = false;
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
       grantedPermission = true;
      } else {
        grantedPermission = false;
        Alert.alert('Permisos necesarios',
          'Para utilizar la aplicación, debes otorgar el permiso de geolocalización.\n\nSi anteriormente denegaste el sistema y le pusiste: no mostrar de nuevo al cuadro para otorgar permiso. Sigue la siguiente ruta para poder otorgar el permiso manualmente:\n\nConfiguración>Apps>App permissions>Ubicación>Busca la aplicación.', [{
              onPress:() => BackHandler.exitApp()}]);
      }
      return grantedPermission;
    } catch (err) {
      Alert.alert('Algo salió mal',
        'Algo salió mal durante la petición de permisos para geolocalización.', [{
          onPress:() => BackHandler.exitApp()}]);
    }
  } else {
    Alert.alert('Dispositivo no soportado', 'La aplicación solo soporta dispositivos android.', [{
      onPress:() => BackHandler.exitApp()}]);
  }
}

// Permissions status
export async function getGeolocationStatus():Promise<boolean> {
  return await PermissionsAndroid.check('android.permission.ACCESS_FINE_LOCATION');
}

// Get the current location
export async function getCurrentLocation():Promise<ICoordinates> {
  return new Promise<ICoordinates>((resolve, reject) => {
    Geolocation.getCurrentPosition((position):any => {
        const { latitude, longitude } = position.coords;
        resolve({latitude, longitude});
      },
      (error) => {
        Alert.alert('Falta de permisos', 'Tienes que otorgar permisos para poder usar la aplicación.',
          [{onPress:() => BackHandler.exitApp()}]);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
  });
}

// Related to geolocation
export async function requestGeolocalizationPermissionsProcess() {
  if (await getGeolocationStatus()) {
    /* Application has already granted the permission */
  } else {
    /* Application doesn't have permissions, so start asking permission process */
    await requestGeolocationPermission();
  }
}
