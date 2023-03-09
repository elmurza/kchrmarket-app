import messaging from '@react-native-firebase/messaging'
import { Alert } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { updateFCM } from "../api";

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
  }
}

export function createForegroundListener () {
  return messaging().onMessage(async remoteMessage => {
    //Alert.alert('Уведомление!', JSON.stringify(remoteMessage))
  })
}

export function createBackgroundListener () {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
  })
}

export async function registerAppWithFCM() {
  await messaging().registerDeviceForRemoteMessages();
}

export async function initFCM () {
  const fcmToken = await messaging().getToken()
    if (fcmToken) {
      await updateFCM(fcmToken)
    } else {
      console.warn('No token was returned from FCM');
    }
}
