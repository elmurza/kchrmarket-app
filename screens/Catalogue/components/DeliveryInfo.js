import React, { useContext } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import SText from "../../../components/SText";
import Icon from "../../../components/Icon";
import DataContext from "../../../data/DataContext";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../../utils/Colors";
import moment from "moment";
import {dayFormat, DELIVERY_BLOCK_HEIGHT, inputFormat} from "../../../config";
import { removeYear } from "../../../utils/other";

export function getHumanDateTime(dateTime) {
  if (dateTime === false)
    return false
  const isToday = moment(dateTime, inputFormat).isSame(moment(), "day");
  const isTomorrow = moment(dateTime, inputFormat).isSame(moment().add(1, "days"), "day");
  const isYesterday = moment(dateTime, inputFormat).isSame(moment().subtract(1, "days"), "day");
  const getLabel = () => {
    if (isToday)
      return 'Сегодня'
    if (isTomorrow)
      return "Завтра"
    if (isYesterday)
      return 'Вчера'

    return moment(dateTime, inputFormat).format(dayFormat)
  }

  const time = moment(dateTime, inputFormat).format('HH:mm')

  return `${removeYear(getLabel())} с ${time}`
}

const DeliveryInfo = () => {
  const {userLocation, deliverySlots} = useContext(DataContext)
  const {navigate} = useNavigation()

  function onPickAddress () {
    navigate('Map')
  }

  const address = userLocation.data?.address

  const nearestDateTime = !!address ? getHumanDateTime(deliverySlots.data?.slots?.[0]?.start || false) : false

  return <View onLayout={e=>console.log(e.nativeEvent)} style={styles.container}>
    <SText fontWeight={900} fontSize={20}>{'ДОСТАВКА:'}</SText>
    <TouchableOpacity style={{ ...styles.row, minHeight: 50 }} onPress={onPickAddress}>
      <Icon iconSrc={require('../../../assets/images/mapPinGreen.png')} size={24} style={{marginRight: 16}}/>
      <SText fontSize={18} fontWeight={address ? 700 : 400} color={address ? Colors.darkBlue :'#c7c7c7'} numberOfLines={2} style={{flex: 1}}>{address || 'Выбрать адрес\nдоставки'}</SText>
      <Icon iconSrc={require('../../../assets/images/chevronRight.png')} size={12} style={{marginLeft: 12}}/>
    </TouchableOpacity>
    <View style={styles.row}>
      <Icon iconSrc={nearestDateTime ?
          require('../../../assets/images/clock.png') :
          require('../../../assets/images/clockGray.png')}
            size={24}
            style={{marginRight: 16}}
      />
      <SText fontSize={nearestDateTime ? 18 : 14}
             fontWeight={nearestDateTime ? 700 : 400}
             color={nearestDateTime ? Colors.darkBlue : '#c7c7c7'}
             style={{flex: 1}}>
        {nearestDateTime || 'После ввода адреса, мы скажем ближайшее время доставки'}
      </SText>
    </View>
  </View>
}

export default DeliveryInfo


const styles = StyleSheet.create({
  container: {
    maxHeight: DELIVERY_BLOCK_HEIGHT,
    minHeight: DELIVERY_BLOCK_HEIGHT,
    paddingTop: 20
  },
  row: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  }
})
