import React from 'react'
import { Alert } from "react-native";
import { vibrate } from "../utils/other";

function launchDialog(
  {
    title='',
    message='',
    onOk = () => {},
    textOk='ОК',
    onCancel= () => {},
    textCancel='Отменить',
    propsOk ={},
    propsCancel = {},
  }
) {
  return () => {
    vibrate()
    Alert.alert(
      title,
      message,
      [
        {text: textOk, onPress: onOk, ...propsOk},
        {text: textCancel, onPress: onCancel, ...propsCancel},
      ]
    )
  }
}

export default launchDialog
