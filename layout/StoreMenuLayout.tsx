import React, { useState, useEffect } from 'react';
import { View, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import tw from 'twrnc';

const StoreMenuLayout = () => {
  const [location, setLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [permissionGranted, setPermissionGranted] = useState(false);

  // Request location permission for Android (iOS handles this automatically with the plist)
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Access Permission",
            message: "We need access to your location to show it on the map.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionGranted(true);
        } else {
          console.log("Location permission denied");
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      setPermissionGranted(true); // Assume permission granted on iOS
    }
  };

  // Get the current location
  const getCurrentLocation = () => {
    if (permissionGranted) {
      console.log("Pemissions granted")
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            ...location,
            latitude,
            longitude,
          });
        },
        (error) => {
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      console.log('Ask permissions');
    }
  };

  useEffect(() => {
    requestLocationPermission();
    if (permissionGranted) {
      getCurrentLocation();
    }
  }, [permissionGranted]);

  return (
    <View style={tw`flex-1`}>
      <MapView
        style={tw`flex-1`}
        region={location}
        showsUserLocation={true}  // Show the user's current location
        showsMyLocationButton={true}  // Button to return to user's location
      >
        {/* Add a marker at the user's current position */}
        <Marker
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title="You are here"
          description="This is your current location"
        />
      </MapView>
    </View>
  );
};

export default StoreMenuLayout;
