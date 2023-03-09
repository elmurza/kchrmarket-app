import { Image, TouchableOpacity, View } from "react-native";
import SText from "../../../components/SText";
import React from "react";

const AmountSelector = ({ currentAmount, handleChange, limit }) => {
  if (currentAmount == 0) return null;

  return <View style={{
    width: "100%",
    height: "100%",
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  }}>
    <View style={{
      flexDirection: "row",
      backgroundColor: "rgba(255,255,255,0.85)",
      borderRadius: 17,
      height: 49,
      alignItems: "center",
    }}>
      <TouchableOpacity onPress={() => handleChange(-1)}
                        onLongPress={() => handleChange(-currentAmount)}
                        style={{
                          flex: 1,
                          height: "100%",
                          alignItems: "flex-start",
                          justifyContent: "center",
                          paddingLeft: 12,
                        }}
      >
        <Image source={require("../../../assets/images/minusBlack.png")}
               style={{ width: 20 }}
               resizeMode={"contain"} />
      </TouchableOpacity>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <SText fontSize={20} fontWeight={700}>{currentAmount}</SText>
      </View>
      <TouchableOpacity onPress={() => handleChange(1)}
                        style={{
                          flex: 1,
                          height: "100%",
                          alignItems: "flex-end",
                          justifyContent: "center",
                          paddingRight: 12,
                        }}
      >
        <Image source={require("../../../assets/images/plusBlack.png")}
               style={{ width: 20 }}
               resizeMode={"contain"} />
      </TouchableOpacity>
    </View>
    {limit === currentAmount ? <View style={{
      backgroundColor: "rgba(255,255,255,0.85)",
      height: 32,
      width: "100%",
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      position: "absolute", bottom: 26,
    }}>
      <SText fontWeight={900} fontSize={14}>{"Это максимум"}</SText>
    </View> : null}
  </View>;
};


export default AmountSelector;
