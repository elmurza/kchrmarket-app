import React, { useContext, useEffect, useMemo } from "react";
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import ModalHeader from "../../components/ModalHeader";
import { useNavigation } from "@react-navigation/native";
import SText from "../../components/SText";
import Icon from "../../components/Icon";
import { circle } from "../../utils/mixins";
import Colors from "../../utils/Colors";
import DataContext from "../../data/DataContext";
import SBar from "../../components/SBar";


const StatusLabel = (text='', color = Colors.mainGreen) => ({text, color})

function getStatusLabel (statusCode) {
  switch (statusCode) {
    case 0: return StatusLabel('Заказ принят')
    case 1: return StatusLabel('Заказ собран')
    case 2: return StatusLabel('Передан на доставку')
    case 3: return StatusLabel('Заказ доставлен')
    case -1: return StatusLabel('Заказ отменён', '#909090')
    default: return StatusLabel('')
  }
}

export function getOrderStatusCode (status) {
  switch (status) {
       case 'created': return 0
       case 'handed_over_for_picking': return  1
       case 'on_the_way': return  2
       case 'delivered': return  3
       case 'canceled': default: return -1
  }
}



const OrderItem = ({order}) => {
  const {navigate} = useNavigation()


  const statusLabel = getStatusLabel(order?.deliveryStatus)


  return <TouchableOpacity onPress={()=>navigate('OrderDetails', {id: order?.id})}
    style={{flexDirection: 'row', minHeight: 100, borderBottomWidth: 1, borderColor: '#ededed', paddingVertical: 12}}>
    <View style={{marginRight: 24}}>
      <Icon iconSrc={require('../../assets/images/box.png')} size={32}/>
    </View>
    <View style={{flex: 1, justifyContent: 'flex-start'}}>
      <SText fontWeight={700} fontSize={14} style={{marginBottom: 10}}>{`Номер ${order?.number}`}</SText>
      <SText fontWeight={700} fontSize={14} style={{marginBottom: 10}}>{`${order?.address}`}</SText>
      <SText fontWeight={700} fontSize={14} style={{marginBottom: 10}} color={statusLabel.color}>{statusLabel.text}</SText>
      {/*todo*/}

      {(order.paymentStatus || order?.deliveryStatus === -1) ? null : <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={circle(16, Colors.red)}>
          <Icon iconSrc={require("../../assets/images/warning.png")} size={10} />
        </View>
        <SText fontWeight={500} fontSize={14} style={{ marginLeft: 8 }}>{"Заказ не оплачен"}</SText>
      </View>}

    </View>
    <View style={{...circle(26, Colors.orange)}}>
      <Icon iconSrc={require('../../assets/images/chevronRightWhite.png')} size={13}/>
    </View>
  </TouchableOpacity>
}

const OrderHistory = () => {

  const {goBack} = useNavigation()


  const {user} = useContext(DataContext)

  useEffect(()=>{
    user.get()
  }, [])

  const orders = useMemo(()=>{
    return user.data?.orders?.map(order=>({
      id: order.id,
      number: order.id,
      address: order.address,
      paymentStatus: order.status_payment !== 0,
      deliveryStatus: getOrderStatusCode(order.status),
      type_payment: order.type_payment,
    }))
  }, [user.data.orders])


  return <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
    <SBar/>
    <ModalHeader onClose={goBack}/>
    <ScrollView style={{flex: 1, padding: 20}}>
      <SText fontWeight={900} fontSize={34} style={{marginBottom: 24}}>{'История заказов'}</SText>
      {[...orders].reverse().map(order=><OrderItem order={order} key={order?.id}/> )}
    </ScrollView>
  </SafeAreaView>
}

export default OrderHistory

const styles = StyleSheet.create({

})
