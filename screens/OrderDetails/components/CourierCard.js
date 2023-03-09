import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "../../../components/Icon";
import SText from "../../../components/SText";
import FastImage from "react-native-fast-image";
import Colors from "../../../utils/Colors";
import { launchCall, launchWhatsApp } from "../../UserModal/utils";


const Button = ({ icon, label, color, onPress }) => {
  return <TouchableOpacity style={{ ...styles.button, backgroundColor: color }} onPress={onPress}>
    <Icon iconSrc={icon} />
    <SText style={{marginLeft: 8}} fontSize={14} fontWeight={700} color={'#fff'}>
      {label}
    </SText>
  </TouchableOpacity>;
};


const CourierCard = ({name='', phone= ''}) => {
  return <>
    <SText fontWeight={500} style={{marginBottom: 12}}>{'Ваш заказ доставляет: '}</SText>
    <View style={styles.card}>
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
      <FastImage
        source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png" }}
        style={styles.image}
      />
      <SText fontWeight={500} style={{ flex: 1 }}>{name}</SText>
    </View>
    <View style={{ flexDirection: "row" }}>
      <Button icon={require("../../../assets/images/whatsapp.png")}
              color={Colors.mainGreen}
              onPress={()=>launchWhatsApp(phone)}
              label={"Написать"} />
      <View style={{ width: 20 }} />
      <Button icon={require("../../../assets/images/phone.png")}
              color={Colors.orange}
              onPress={()=>launchCall(phone)}
              label={"Позвонить"} />
    </View>
  </View>
  </>;
};

export default CourierCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ededed",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21
  },
  image: {
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: '#dadada',
    marginRight: 12
  }
});
