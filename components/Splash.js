import React from "react";
import { Image, SafeAreaView } from "react-native";
import Colors from "../utils/Colors";


const Preloader = ({}) => {
  return <SafeAreaView style={{flex: 1, backgroundColor: Colors.orange, alignItems: 'center', justifyContent: 'center'}}>
    <Image source={require('../assets/images/preloader_logo.png')} style={{
      width: 215,
      height: 215,
    }}/>
  </SafeAreaView>
}

export default Preloader
