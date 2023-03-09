import {Platform, StatusBar} from "react-native";
import React from "react";

const SBar = ({darkContent = false}) => {
  if (Platform.OS === "android")
    return <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} animated/>

  return <StatusBar barStyle={darkContent ? "dark-content" : "light-content"} animated/>
}

export default SBar
