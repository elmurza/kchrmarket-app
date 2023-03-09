import React, {useEffect, useRef} from 'react';
import { Text, StyleSheet, View } from "react-native";

import { CodeField, Cursor} from 'react-native-confirmation-code-field';
import SText from "../../../components/SText";

const Cell = ({index, symbol, isFocused}) => {
  return <View style={styles.cell}>
    {symbol ?
      <SText fontSize={42} fontWeight={700}>{symbol}</SText> :
      <View style={styles.dot}/>
    }
  </View>
}

const CodeInput = ({value='', onValueChange = ()=>{}, cellCount=4, isSucceed=false, onDismissError=()=>{}}) => {
  const ref = useRef(null)

  function handleChange(newValue) {
    const regex = /^\d{0,4}$/;
    regex.test(newValue) && onValueChange(newValue)
  }

  useEffect(()=>{
    if (value.length < cellCount)
      onDismissError()
  }, [value.length])

  useEffect(()=>{
    if (isSucceed && ref.current)
      ref.current.blur()
  }, [isSucceed])

  return (
    <CodeField
      ref={ref}
      autoFocus={true}
      value={value}
      onChangeText={handleChange}
      cellCount={cellCount}
      rootStyle={styles.codeFieldRoot}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      renderCell={Cell}
    />
  );
};

const styles = StyleSheet.create({
  cell: {
    width: 40,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8
  },

  codeFieldRoot: {
    justifyContent: 'center'
  },

  dot: {
    backgroundColor: '#bdbdbd',
    width: 12,
    height: 12,
    borderRadius: 6,
  }
});


export default CodeInput
