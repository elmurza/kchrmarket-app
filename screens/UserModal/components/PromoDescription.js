import React from 'react'
import Modal from "react-native-modalbox";
import { TouchableOpacity, View } from "react-native";
import Icon from "../../../components/Icon";
import { circle } from "../../../utils/mixins";
import SText from "../../../components/SText";
import RoundedButton from "../../../components/RoundedButton";

const PromoDescription = ({isVisible=false, onClose=()=>{}}) => {
  return <Modal
    isOpen={isVisible}
    coverScreen={true}
    onClosed={onClose}
    position={'center'}
    style={{height: 318, width: 302, borderRadius: 12, padding: 16, paddingBottom: 29}}
  >
    <View style={{flex: 1}}>
      <TouchableOpacity style={{ ...circle(), alignSelf: 'flex-end'}} onPress={onClose}>
        <Icon iconSrc={require('../../../assets/images/crossDark.png')} size={12}/>
      </TouchableOpacity>
      <SText fontSize={20} fontWeight={700} style={{alignSelf: 'center', textAlign: 'center', marginBottom: 16}}>
        {'А это ваш промокод!'}
      </SText>
      <SText gap fontSize={16} fontWeight={500} style={{alignSelf: 'center', textAlign: 'center', marginBottom: 16, marginHorizontal: -4}}>
        {'Подарите другу 300 бонусов \n' +
      'на первый заказ и получите \n' +
      '300 бонусов на свой счёт. \n' +
      'Для этого поделитесь промокодом со своими друзьями и ожидайте, когда они оформят заказ!'}
      </SText>
      <View style={{flex:1}}/>
      <RoundedButton label={'Ясно'} onPress={onClose} containerStyle={{alignSelf: 'center'}}/>
    </View>
  </Modal>
}

export default PromoDescription
