import React from 'react'
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import Colors from "../utils/Colors";

const IconButton = ({icon, onPress, color=Colors.darkBlue, disabled, ...props}) => {
  return <TouchableOpacity onPress={onPress} disabled={disabled} style={{...styles.button, backgroundColor: color, ...props.style}} {...props}>
    <Image source={icon} style={{width: 13, height: 13,}} resizeMode={'contain'}/>
  </TouchableOpacity>
}
export default IconButton

const styles = StyleSheet.create({
  button: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  }
})
