import React from 'react'
import { ActivityIndicator, Image, SafeAreaView } from "react-native";
import Colors from "../utils/Colors";

const Preloader = ({}) => {
  return <SafeAreaView style={{flex: 1, backgroundColor: "#fff", alignItems: 'center', justifyContent: 'center'}}>
    <ActivityIndicator color={Colors.darkBlue} size={"large"}/>
  </SafeAreaView>
}

export default Preloader
