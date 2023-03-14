import React, { useEffect, useState } from "react";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import MainRouter from "./routers/MainRouter";
import DataContext, { useAppData } from "./data/DataContext";
import Splash from "./components/Splash";
import AsyncStorage from "@react-native-community/async-storage";
import { getUserInfo } from "./api";
import moment from "moment";
import "moment/locale/ru";
import { isInMoscow } from "./utils/regionDeterminer";
import { SearchContext, useContextSearch } from "./data/SearchContext";
import PreloaderAuth from "./components/PreloaderAuth";
import AppMetrica from "react-native-appmetrica";
import { APPMETRICA_APIKEY } from "./config";
import {
  createBackgroundListener,
  createForegroundListener,
  initFCM,
  registerAppWithFCM,
  requestUserPermission,
} from "./utils/Firebase";
import { firebase } from "@react-native-firebase/messaging";

moment.locale('ru')

export const RegionContext = React.createContext({region: 77, setRegion: ()=>{}})

const useRegionContext = () => {
  const [state, setState] = useState(null)
  const [isMigrating, setMigrating] = useState(false)


  return {region: state, setRegion: setState, isMigrating, setMigrating}
}
const AppWrapper = () => {


  const regionData = useRegionContext()

  async function detectRegion () {
    const isAuthorized = await AsyncStorage.getItem('token')
    if (isAuthorized) {
      const response = await getUserInfo()
      if (!response) {
        regionData.setRegion(77) // todo ask
        AsyncStorage.removeItem('token')
        return
      }
      const location = response.address?.[(response.address?.length || 1) - 1] || {}
      if (location) {
        regionData.setRegion(isInMoscow(location.lat, location.lon) ? 77 : 78)
      } else {
        regionData.setRegion(77) //todo ask
      }
    } else {
      regionData.setRegion(77)
    }
  }

  useEffect(()=>{
    (async () => {
      AppMetrica.activate({
        apiKey: APPMETRICA_APIKEY,
        sessionTimeout: 120,
        firstActivationAsUpdate: true,
      });

      AppMetrica.reportEvent('Открыто приложение')

      detectRegion();

      requestUserPermission();

      await registerAppWithFCM()
    })()
  }, [])

  useEffect(()=>{
    return createForegroundListener()
  },[])

  useEffect(()=>{
    return createBackgroundListener()
  },[])


  if (!regionData.region) return <Splash/>

  return <RegionContext.Provider value={regionData}>
      <App/>
    {regionData.isMigrating && <PreloaderAuth/>}
    </RegionContext.Provider>

}

const App = () => {


  const {fetchAll, ...data} = useAppData()
  const searchData = useContextSearch()
  const [isLoaded, setLoaded] = useState(false)

  const backgroundStyle = {
    backgroundColor: "#FFF",
    flex: 1,
  };

  async function init () {
    setLoaded(false)
    await fetchAll()
    setLoaded(true)
  }

  useEffect(()=>{
    init()
  }, [])

  if (!isLoaded) return <Splash/>

  return <SafeAreaView style={backgroundStyle}>
    <DataContext.Provider value={data}>
      <SearchContext.Provider value={searchData}>
        <NavigationContainer>
          <MainRouter/>
        </NavigationContainer>
      </SearchContext.Provider>
    </DataContext.Provider>
  </SafeAreaView>

};

export default AppWrapper;
