import React from "react";
import { TextInput } from "react-native";
import { text } from "../utils/mixins";
import Colors from "../utils/Colors";


const Input = ({ onValueChange=()=>{}, value='', placeholder='', error=false }) => (
  <TextInput numberOfLines={1}
             onChangeText={onValueChange}
             style={{
               ...text(18, 700, 2),
               color: Colors.darkBlue,
               textAlignVertical: "center",
               borderBottomWidth: 2,
               borderBottomColor: error ? Colors.red : '#ededed',
               height: 50,
               paddingTop: 0,
               paddingHorizontal: 4,
               paddingBottom: 0,
             }}
             value={value}
             underlineColorAndroid={"transparent"}
             placeholder={placeholder}
             placeholderTextColor={"#bdbdbd"} />
);

export default Input;
