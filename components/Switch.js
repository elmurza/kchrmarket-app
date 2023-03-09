import React from "react";
import {TouchableOpacity, View, StyleSheet} from "react-native";
import { circle } from "../utils/mixins";
import Icon from "./Icon";
import { vibrate } from "../utils/other";

const ToggleButton = ({
  isOn = false,
  onToggle = () => {},
  disabled = false,
  colors: {backgroundOn = "#2DCC70", backgroundOff = "#EDEDED"} = {},
}) => {
  const currentStyle = styles(isOn, {backgroundOn, backgroundOff});

  function onChange() {
    onToggle(!isOn);
  }
  return (
    <TouchableOpacity
      onPress={()=>{onChange(); vibrate()}}
      style={{opacity: disabled ? 0.5 : 1}}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={currentStyle.background}>
        <View style={currentStyle.switch} />
      </View>
    </TouchableOpacity>
  );
};

export default ToggleButton;

export const CheckBox = ({
                           isOn = false,
                           onToggle = () => {
                           },
                           disabled = false,
                           colors: { backgroundOn = "#2DCC70", backgroundOff = "#EDEDED" } = {},
                         }) => {

  return <TouchableOpacity style={{
                                    ...circle(25, isOn ? backgroundOn : "transparent"),
                                    borderColor: backgroundOn,
                                    borderWidth: 1,
                                  }}
                           disabled={disabled}
                           onPress={()=> {
                             onToggle();
                             vibrate()
                           }}
  >
    <Icon size={13} iconSrc={require("../assets/images/check.png")} style={{opacity: isOn ? 1 : 0}}/>
  </TouchableOpacity>;
};

const styles = (isOn, colors) =>
  StyleSheet.create({
    background: {
      width: 50,
      height: 30,
      borderRadius: 15,
      padding: 2,
      backgroundColor: isOn ? colors.backgroundOn : colors.backgroundOff,
      flexDirection: "row",
      justifyContent: isOn ? "flex-end" : "flex-start",
      alignItems: "center",
    },
    switch: {
      height: 26,
      width: 26,
      borderRadius: 13,
      backgroundColor: "#FFF",
      shadowColor: "#000",
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.2,
      shadowRadius: 1.41,

      elevation: 2,
    },
  });
