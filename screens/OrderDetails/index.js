import React, { useEffect, useMemo, useState } from "react";
import {Linking, SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import ModalHeader from "../../components/ModalHeader";
import { useNavigation, useRoute } from "@react-navigation/native";
import SText from "../../components/SText";
import Colors from "../../utils/Colors";
import ProgressBar from "./components/ProgressBar";
import { circle } from "../../utils/mixins";
import Icon from "../../components/Icon";
import SupportButton from "../../components/SupportButton";
import Preloader from "../../components/Preloader";
import { getOrder } from "../../api";
import {getOrderStatusCode} from "../OrderHistory";
import {getHumanDateTime} from "../Catalogue/components/DeliveryInfo";
import OrderProduct from "./components/OrderProduct";
import {PriceRow, TotalRow} from "../CartModal/components/TotalRow";
import RoundedButton from "../../components/RoundedButton";
import CourierCard from "./components/CourierCard";
import Rate, { AndroidMarket } from 'react-native-rate'
import SBar from "../../components/SBar";


function Status (label='', barIndex) {
  return {label: label.toUpperCase(), barIndex}
}

function getOrderStatus (status) {
  switch (status) {
    case 0: return Status('Заказ\nпринят', 0)
    case 1: return Status('Заказ\nсобран', 1)
    case 2: return Status('Заказ передан\nна доставку', 2)
    case 3: return Status('Заказ\nдоставлен', 3)
    case -1: return Status('Заказ\nотменён', -1)
    default: return Status('Заказ\nпринят', 0)
  }
}

function processAddress (address = '', comment='') {
  return address
      .replace('кв/офис', '\nКв/офис')
      .replace('подъезд', '\nПодъезд')
      .replace('этаж', '\nЭтаж') + (comment !== '' ? ('\nКомментарий: ' + comment) : '')

}

const OrderDetails = () => {
  const {goBack} = useNavigation()
  const {params} = useRoute()

  const [order, setOrder] = useState(null)


  async function loadOrder () {
    if (!params?.id) {
      goBack()
      return
    }
    const response = await getOrder(params.id);
    if (response?.order?.id) {
      setOrder(response.order)
    }
    else
      goBack();
  }

  useEffect(()=>{
    loadOrder()
    if (params.askToRate) {
      const options = {
        AppleAppID:"1592363671",
        GooglePackageName:"com.season_market",
        preferredAndroidMarket: AndroidMarket.Google,
        preferInApp: true,
        openAppStoreIfInAppFails: false,
        fallbackPlatformURL:"https://seasonmarket.ru/",
      }
      Rate.rate(options)
    }
  }, [params?.id])

  const statusCode = getOrderStatusCode(order?.status)

  const {label, barIndex} = useMemo(()=>getOrderStatus(statusCode), [order?.status])

  if (!order) return <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
    <SBar/>
    <ModalHeader onClose={goBack}/>
    <Preloader/>
  </SafeAreaView>

  const totals = {
    products: order.full_amount,
    delivery: order.delivery_price,
    discount: order.amount_bonuses,
    toPay: Number(order.amount) + Number(order.delivery_price),
    payed: order.status_payment != 0 || statusCode === -1,
    isCash: order.type_payment == 1,
  }



  return <SafeAreaView style={{flex: 1, backgroundColor: '#FFF'}}>
    <ModalHeader onClose={goBack}/>
    <ScrollView style={{flex: 1, padding: 20}}>
      <SText fontSize={34} fontWeight={900} style={{marginBottom: 16}}>{label}</SText>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <SText fontSize={14} fontWeight={500} color={Colors.orange}>{`Номер ${order.id}`}</SText>
        {!totals.payed ?  <View style={{ flexDirection: "row", alignItems: "center", paddingRight: 10 }}>
          <SText fontWeight={500} fontSize={14} style={{ marginRight: 8 }}>{totals.isCash ? "Оплата наличными" : "Заказ не оплачен"}</SText>
          {totals.isCash ? null : <View style={circle(16, Colors.red)}>
            <Icon iconSrc={require("../../assets/images/warning.png")} size={10} />
          </View>}
        </View> : null}
      </View>
      <ProgressBar activeIndex={barIndex}/>
      <View style={styles.block}>
        {(statusCode === 0 || statusCode === 1) ? <>
          <SText fontWeight={500} fontSize={13} style={{marginBottom: 12}}>{"Мы сообщим, когда заказ будет " + (statusCode === 0 ? 'собран' : 'передан курьеру')}</SText>
          <SText fontWeight={400} fontSize={12} style={{marginBottom: 12}}>{"Итоговая сумма вашего заказа может варьироваться \n" +
          "в пределах 10%, если в заказе есть весовой товар.\n" +
          "В таком случае будет осуществлен возврат части денежных средств или дополнительное списание, как только заказ будет собран."}
          </SText>
        </> : null}
        {statusCode === 2 ?
          <CourierCard name={order?.courier} phone={order?.courier_phone}/>
          : null}
        {statusCode !== -1 ? <SupportButton/> : null}
      </View>
      <View style={styles.block}>
        <SText fontSize={24} fontWeight={900} style={{marginBottom: 16}}>{'ДОСТАВКА'}</SText>
        <View style={styles.deliveryRow}>
          <Icon iconSrc={require('../../assets/images/MapPinBlack.png')} size={24} style={{marginRight: 12}}/>
          <SText fontWeight={700} fontSize={14} style={{flex: 1, marginTop: 5}} gap>
            {processAddress(order?.address, order?.comment)}
          </SText>
        </View>
        <View style={styles.deliveryRow}>
          <Icon iconSrc={require('../../assets/images/clock.png')} size={24} style={{marginRight: 12}}/>
          <SText fontWeight={700} fontSize={14} style={{flex: 1, marginTop: 5}} gap>
            {getHumanDateTime(order?.date_interval + ' ' + order?.time_interval)}
          </SText>
        </View>
      </View>
      <View style={{...styles.block, borderBottomWidth: 0}}>
        <SText fontSize={24} fontWeight={900} style={{marginBottom: 16}}>{'ВЫ ЗАКАЗАЛИ'}</SText>
        {order.orderProducts?.map(item=><OrderProduct key={item.id} id={item.product_id} price={item.price} amount={item.quantity}/>)}
        <View style={{height: 12}}/>
        <PriceRow name={'Стоимость товаров'} amount={totals.products}/>
        <PriceRow name={'Стоимость доставки'} amount={totals.delivery} free/>
        <PriceRow name={'Скидка'} color={Colors.mainGreen} amount={totals.discount}/>
        <TotalRow name={'ИТОГ'} amount={totals.toPay}/>
      </View>
      {totals.payed ? null :
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", alignSelf: 'flex-end', paddingRight: 10, marginBottom: 24}}>
              <SText fontWeight={500} fontSize={14} style={{ marginRight: 8 }}>{"Заказ не оплачен"}</SText>
              <View style={circle(16, Colors.red)}>
                <Icon iconSrc={require("../../assets/images/warning.png")} size={10} />
              </View>
            </View>
            <RoundedButton label={'Оплатить ' + Math.ceil(totals.toPay) + ' ₽'}
                           onPress={() => Linking.openURL('https://seasonmarket.ru/pay/' + order.id)}/>
          </View>}
      <View style={{height: 75}}/>
    </ScrollView>
  </SafeAreaView>
}

export default OrderDetails

const styles = StyleSheet.create({
  block: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ededed'
  },
  deliveryRow: {
    flexDirection: 'row',
    marginBottom: 4
  }
})
