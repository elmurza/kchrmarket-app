import React from "react";
import { StyleSheet, View } from "react-native";
import SText from "./SText";
import Colors from "../utils/Colors";
import Switch from "./Switch";

const mainTextProps = {
  color: Colors.grayFont,
  fontSize: 11,
  fontWeight: 700,
  fontType: 2,
}
const accentTextProps = {
  ...mainTextProps,
  color: Colors.mainGreen
}

const AgreementsBlock = ({isAgreed=false, setAgreed=()=>{}}) => {
  return <View style={styles.container}>
    <View style={styles.adsBlock}>
      <SText {...mainTextProps} style={{flex: 1, marginRight: 16}}>
        {'Я даю '}
        <SText {...accentTextProps}>
          {'согласие '}
        </SText>
        {'на получение рекламных сообщений'}
      </SText>
      <Switch isOn={isAgreed} onToggle={setAgreed}/>
    </View>
    <View style={styles.policyBlock}>
      <SText {...mainTextProps}>
        {'Нажимая "Отправить СМС, я соглашаюсь с '}
        <SText {...accentTextProps}>
          {'Условиями продажи'}
        </SText>
        {', '}
        <SText {...accentTextProps}>
          {'Политикой конфиденциальности'}
        </SText>
        {' и '}
        <SText {...accentTextProps}>
          {'Политикой в отношении обработки персональных данных'}
        </SText>
        {'.'}
      </SText>
    </View>
  </View>
}

export default AgreementsBlock

const styles = StyleSheet.create({
  container: {

  },
  adsBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16

  },
  policyBlock: {},
})
