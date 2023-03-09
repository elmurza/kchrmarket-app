import React from "react";
import Colors from "../utils/Colors";
import { StyleSheet, View } from "react-native";

const StrikedView = ({strikeColor=Colors.red, ...props}) => {
  return <View style={styles.view}>
    <View style={{...styles.strike, backgroundColor: strikeColor}}/>
    {props.children}
  </View>
}


const styles = StyleSheet.create({
  view: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  strike: {
    position: 'absolute',
    width: '100%',
    top: '30%',
    left: 0,
    height: 2,
    zIndex: 10,
  }
})
export default StrikedView
