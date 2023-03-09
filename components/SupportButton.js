import React from 'react'
import { onContactSupport } from "../screens/UserModal/utils";
import Icon from "./Icon";
import SText from "./SText";
import RoundedButton from "./RoundedButton";

const SupportButton = ({onPress=()=>{}}) => <RoundedButton async={false} onPress={onContactSupport}>
  <Icon iconSrc={require('../assets/images/chat.png')} size={32}/>
  <SText color={'#fff'} fontSize={18} fontWeight={700} style={{marginLeft: 12}}>{'Служба поддержки'}</SText>
</RoundedButton>


export default SupportButton
