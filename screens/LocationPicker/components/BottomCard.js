import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import RoundedButton from "../../../components/RoundedButton";
import SText from "../../../components/SText";
import IconButton from "../../../components/IconButton";
import BottomModal from "../../../components/BottomModal";
import { modalHeight } from "../../../config";
import { text } from "../../../utils/mixins";
import Colors from "../../../utils/Colors";
import { getAddressSuggestions } from "../../../api";

const BottomCard = ({address='', onAddressChange=()=>{}, onSubmit=()=>{}, disabled}) => {
  const [addressModalVisible, setAddressModalVisible] = useState(false)

  function submitSuggestedAddress (point) {
    setAddressModalVisible(false)
    onAddressChange(point)
  }
  return <>
    <AddressModal onClose={()=>setAddressModalVisible(false)} isOpen={addressModalVisible} onSubmit={submitSuggestedAddress}/>
    <View style={styles.wrapper}>
    <View style={styles.addressRow}>
      <SText style={{ flex: 1 }} fontSize={18} fontWeight={700}>{address}</SText>
      <IconButton icon={require("../../../assets/images/pen.png")} onPress={() => setAddressModalVisible(true)} />
    </View>
    <View>
      <RoundedButton label={"Доставка по этому адресу"}
                     onPress={onSubmit}
                     disabled={disabled}
      />
    </View>
  </View>
  </>
}

const AddressModal = ({isOpen, onClose, onSubmit=()=>{}}) => {
  const [value, onValueChange] = useState('')
  const [timer, setTimer] = useState(null)
  const [suggestedItems, setSuggestedItems] = useState([])

  function getSuggestions() {
    if (timer)
      clearTimeout(timer);
    const newTimer = setTimeout(async () => {
      const response = await getAddressSuggestions(value);
      setSuggestedItems(response || []);
    }, 500);

    setTimer(newTimer);

  }

  useEffect(()=>{
    getSuggestions()
  }, [value])

  return  <BottomModal isOpen={isOpen}
                       height={modalHeight}
                       onClose={onClose}
  >
    <View style={styles.inputWrapper}>
      <TextInput numberOfLines={1}
                  onChangeText={onValueChange}
                  style={styles.addressInput}
                  value={value}
                  underlineColorAndroid={"transparent"}
                  placeholder={"Введите адрес"}
                  placeholderTextColor={"#bdbdbd"}
    />
      {!!value.length && <TouchableOpacity onPress={()=>onValueChange('')}
        style={{
        backgroundColor: "#c6c6c6",
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
      }}>
        <Image source={require('../../../assets/images/cross.png')} style={{width: 12, height: 12}}/>
      </TouchableOpacity>}
    </View>
    <ScrollView style={{flex: 1}} keyboardDismissMode={"on-drag"} keyboardShouldPersistTaps={"handled"}>
      {suggestedItems.map(({name, point}, index)=>{
        return <TouchableOpacity style={styles.suggestedItem} key={index} onPress={()=>onSubmit(point)}>
          <SText fontSize={18} fontWeight={400}>{name}</SText>
        </TouchableOpacity>
      })}
    </ScrollView>
  </BottomModal>
}
export default BottomCard

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    justifyContent: 'space-between',
    flex: 1,
    zIndex: 100
  },
  addressRow: {
    flexDirection: 'row'
  },
  addressInput: {
    ...text(18, 700, 2),
    color: Colors.darkBlue,
    textAlignVertical: 'center',
    height: 50,
    paddingTop: 0,
    paddingBottom: 0,
    flex: 1,
  },
  suggestedItem: {
    paddingVertical: 16,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ededed',
    paddingHorizontal: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    marginTop: 40,
    marginBottom: 20,
    paddingLeft: 12,
    paddingRight: 10,
  },
})
