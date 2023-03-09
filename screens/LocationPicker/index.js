import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import YaMap, { Geocoder, Marker } from "react-native-yamap";
import Geolocation from "react-native-geolocation-service";
import BottomCard from "./components/BottomCard";
import { screenDims } from "../../config";
import DataContext from "../../data/DataContext";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../utils/Colors";
import { validateLocation } from "../../api";
import {isInMoscow} from "../../utils/regionDeterminer";
import AppMetrica from "react-native-appmetrica";

export const randomPoint = { "lat": 55.742047699088175, "lon": 37.61314131981331 };


const LocationPicker = () => {

  const {setLocation, userLocation, user} = useContext(DataContext)
  const [timer, setTimer] = useState(null);
  const [addressString, setAddressString] = useState(userLocation.data?.address || '')
  const [currentPoint, setCurrentPoint] = useState(userLocation.data?.point || false)
  const [isMapVisible, setMapVisible] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const [shouldSpecifyAddress, setShouldSpecifyAddress] = useState({
    missingHome: false,
    notified: false,
  })

  const {goBack} = useNavigation()

  useEffect(()=>{ // Костыль, фиксит случаи, когда карта инициализируется не по размерам контейнера
    Platform.OS === 'ios' ? Geolocation.requestAuthorization('whenInUse') : false
    setTimeout(()=>{
      setMapVisible(true)
    }, 150)
  }, [])

  const mapRef = useRef(null);

  function getCoords(event) {
    setDisabled(true)

    if (timer)
      clearTimeout(timer);

    const _timer = setTimeout(() => {
      getCurrentPosition();
    }, 200);
    setTimer(_timer);
  }

  function getCurrentPosition() {
    return new Promise(resolve => {
      if (mapRef.current) {
        mapRef.current?.getCameraPosition((position => {
          resolve(processPosition(position) || position);
        }));
      }
    });
  }

  async function processPosition(position) {
    const address = await Geocoder.geoToAddress(position.point)
    setCurrentPoint(position.point)
    setAddressString(address?.formatted || '')

    let hasHome = false
    address.Components.forEach(component=>{
      if (hasHome)
        return
      if (component.kind === 'house')
        hasHome = true
    })

    setShouldSpecifyAddress(prev=>({
      notified: false,
      missingHome: !hasHome
    }))

    const response = await validateLocation(position.point.lat, position.point.lon)
    if (response.validate) {
      setDisabled(false)
    }
  }

  function setCameraToPoint(point=randomPoint) {
    if (mapRef.current) {
      mapRef.current.setCenter({lat: Number(point.lat), lon: Number(point.lon)}, 17, 0, 30, .5);
    }
  }

  useEffect(()=>{
    requestPermission(true)
  }, [isMapVisible])

  function setCameraToUserPosition() {
    Geolocation.getCurrentPosition(
      (position) => {
        setCameraToPoint({lat: position.coords.latitude, lon: position.coords.longitude})
      },
      (error) => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  async function submitAddress () {
    if (shouldSpecifyAddress.missingHome && !shouldSpecifyAddress.notified) {
      Alert.alert('Уточните номер дома, пожалуйста!')

      setShouldSpecifyAddress(prevState => ({
        ...prevState,
        notified: true
      }))

      return
    }


    setDisabled(true)
    AppMetrica.reportEvent('Установлен адрес', {USER: user.data?.phone || 'Н/А'})

    await userLocation.update(
      {
        lat: currentPoint.lat?.toString(),
        lon: currentPoint.lon?.toString(),
        address: addressString.replace("Россия, ", ""),
        comment: '',
        floor: '',
        door: '',
        number: ''
      });
    setDisabled(false)
    goBack()
  }

  const requestPermission = async (initial=false) => {

    if (Platform.OS === 'ios') {
      if (userLocation.data?.lat && initial) {
        setCameraToPoint(userLocation?.data)
      } else {
        setCameraToUserPosition()
      }
      return
    }
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setCameraToUserPosition()
      } else {
        setCameraToPoint();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  return <SafeAreaView style={{ flex: 1, backgroundColor: '#fff'}}>
    <TouchableOpacity style={styles.closeButton} onPress={goBack}>
      <Image source={require('../../assets/images/cross.png')} style={{width: 14, height: 14}}/>
    </TouchableOpacity>
    <View style={{ flex: 1}}>
      <View pointerEvents={"none"} style={{
        width: "100%",
        height: "100%",
        zIndex: 10,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
      }}>
        <Image source={require("../../assets/images/pin.png")}
               style={{ width: 128, height: 128 }}
        />
      </View>
      {isMapVisible && <YaMap style={{ flex: 1, width: "100%" }}
              ref={mapRef}
              showUserPosition={false}
              nightMode={false}
              onCameraPositionChange={(e) => getCoords(e)}
      />}
    </View>
    <TouchableOpacity style={styles.currentPositionButton}
                      onPress={()=>requestPermission(false)}
    >
      <Image source={require('../../assets/images/locationArrow.png')}
             style={{width: 23, height: 23}}
      />
    </TouchableOpacity>
    <View style={{ height: 200, marginTop: -10, backgroundColor: '#fff', borderRadius: 10, borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}>
      <BottomCard address={addressString} disabled={disabled} onAddressChange={setCameraToPoint} onSubmit={submitAddress}/>
    </View>
  </SafeAreaView>;
};

export default LocationPicker;

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 100,
    height: 26,
    width: 26,
    borderRadius: 13,
    backgroundColor: Colors.darkBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentPositionButton: {
    width: 53,
    height: 53,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    position: 'absolute',
    bottom: 260,
    right: 20,
    zIndex: 1000,
    backgroundColor: '#fff',

  }
})

