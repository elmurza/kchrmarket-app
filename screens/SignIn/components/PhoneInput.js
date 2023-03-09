import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import Colors from "../../../utils/Colors";
import { TextInputMask } from "react-native-masked-text";
import { text } from "../../../utils/mixins";

const PhoneInput = ({value, onValueChange=()=>{}}) => {
  const ref = useRef(null)

  return <TextInputMask
    ref={ref}
    numberOfLines={1}
    type={'cel-phone'}
    maxLength={18}
    onChangeText={onValueChange}
    onFocus={()=>{value == '' && onValueChange('+7 ')}}
    options={{dddMask: "+7 (999) 999-99-99"}}
    style={styles.input}
    value={value}
    underlineColorAndroid={"transparent"}
    keyboardType={"phone-pad"}
    //autoFocus={true}
    placeholder={"Номер телефона"}
    placeholderTextColor={"#bdbdbd"}
  />
}

export default PhoneInput

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#f7f7f7',
    ...text(18, 700, 2),
    color: Colors.darkBlue,
    textAlignVertical: 'center',
    height: 50,
    paddingHorizontal: 30,
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 8,
  },
});
