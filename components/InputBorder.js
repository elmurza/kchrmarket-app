import React, { useRef } from "react";
import { StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import SText from "./SText";
import {text} from "../utils/mixins";

const InputBorder = ({title='', value='', style={}, onValueChange=()=>{}, ...props}) => {
  const input = useRef(null)

  function focus () {
    if (input.current)
      input.current.focus()
  }

  return <TouchableOpacity style={{ ...styles.container, ...style }} activeOpacity={1} onPress={focus}>
      <SText fontWeight={400} fontSize={12} color={"#bdbdbd"} style={{marginLeft: 8, marginTop: 8}}>{title}</SText>
      <TextInput value={value}
                 ref={input}
                 style={{paddingHorizontal: 8, paddingTop: 0, flex: 1, paddingBottom: 8, ...text()}}
                 onChangeText={onValueChange}
                 multiline={props.multiline || false}
                 {...props}
      />
  </TouchableOpacity>
}

export default InputBorder

const styles = StyleSheet.create({
  container: {
    borderWidth: .5,
    borderColor: '#909090',
    borderRadius: 3,
    minHeight: 50,
  }
})
