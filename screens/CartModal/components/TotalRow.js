import React from "react";
import { View } from "react-native";
import SText from "../../../components/SText";
import Colors from "../../../utils/Colors";

export const PriceRow = ({name, amount, free=false, color=Colors.darkBlue}) => {
  if (!free && amount == 0) return null

  return <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
    <SText fontSize={16} color={color} fontWeight={500} style={{flex: 1}}>{name}</SText>
    <SText fontSize={18} color={color} fontWeight={700}>{amount == 0 ? 'Бесплатно' :Math.ceil(amount)}</SText>
    <SText fontSize={14} color={color} fontWeight={700}>{amount != 0 ? ' ₽' : ''}</SText>
  </View>
}

export const TotalRow = ({name, amount}) => {

  return <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
    <SText fontSize={20} fontWeight={900} style={{flex: 1}}>{name}</SText>
    <SText fontSize={20} fontWeight={900}>{Math.ceil(amount)}</SText>
    <SText fontSize={16} fontWeight={900}>{' ₽'}</SText>
  </View>
}
