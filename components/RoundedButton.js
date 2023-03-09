import React from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import {text} from "../utils/mixins";
import Colors from "../utils/Colors";
import { useWaiting } from "../utils/hooks";

const RoundedButton = ({
                       onPress = () => {},
                       label = 'Button',
                       containerStyle={},
                       activeColor = Colors.darkBlue,
                       isDimmed = false,
                       async = true,
                       dimmedColor = Colors.grayFont,
                       disabled = false,
                       children = null,
                       ...props}) => {

  const [waiting, cb] = useWaiting(onPress)

  return <TouchableOpacity onPress={async ? cb : onPress}
                           activeOpacity={.8}
                           disabled={disabled || waiting}
                           style={[
                             {...styles.shape,
                               backgroundColor: (isDimmed || disabled ) ?
                                 dimmedColor : activeColor},
                             containerStyle,
                             (disabled ? styles.disabled : {}),
                           ]}
                           {...props}
  >
    {waiting ?
      <ActivityIndicator color={'#fff'}/> :
     (children || <Text style={styles.label}>{label}</Text>)}
  </TouchableOpacity>
}

export default RoundedButton

const styles = StyleSheet.create({
  shape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 49,
    width: '100%',
    borderRadius: 40,
  },
  disabled: {
   // backgroundColor: '#bfbfbf'
  },
  label: {
    ...text(16,500, 2),
    marginTop: -3,
    color: '#FFFFFF'
  },
})
