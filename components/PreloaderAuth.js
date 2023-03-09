import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { screenDims } from "../config";
import Colors from "../utils/Colors";
import SText from "./SText";

const PreloaderAuth = () => {
  return <View style={styles.container}>
    <ActivityIndicator color={Colors.darkBlue} size={"large"}/>
    <SText color={'#909090'} style={{marginTop: 8}}>{'Синхронизация...'}</SText>
  </View>
}
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: '#FFFFFFFA',
    top: 0,
    left: 0,
    height: screenDims.height,
    width: screenDims.width,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

})

export default PreloaderAuth
