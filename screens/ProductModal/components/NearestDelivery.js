import { Image, StyleSheet, View } from "react-native";
import Colors from "../../../utils/Colors";
import React from "react";
import SText from "../../../components/SText";

const NearestDelivery = () => {
  return <View style={{flexDirection: 'row', marginVertical: 16}}>
    <View style={styles.wrapper}>
    <Image source={require("../../../assets/images/rocket.png")}
           style={{ height: 37, width: 37, marginTop: -3 }}
           resizeMode={"contain"}
    />
    <SText color={"#fff"} fontWeight={700} fontSize={14}>{"Доставим сегодня"}</SText>
  </View>
  </View>
}

export default NearestDelivery


const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.orange,
    flexDirection: 'row',
    height: 37,
    alignItems: 'center',
    borderRadius: 4,
    paddingRight: 16,
    paddingLeft: 8,
  }
})
