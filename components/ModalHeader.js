import React from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import IconButton from "./IconButton";

const ModalHeader = ({onClose=()=>{}}) => {
  return <View style={{height: 48, flexDirection: 'row', paddingHorizontal: 16, alignItems: 'center'}}>
    <View style={{width: 26}}/>
    <TouchableOpacity style={{flex: 1, alignItems: 'center'}} onPress={onClose}>
      <View style={{width: 46, height: 6, borderRadius: 3, backgroundColor: Platform.OS == 'ios' ? '#ededed' : 'transparent'}}/>
    </TouchableOpacity>
    <IconButton icon={require('../assets/images/crossDark.png')} onPress={onClose} color={'#f5f5f5'}/>
  </View>
}

export default ModalHeader
