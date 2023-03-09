import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Keyboard, KeyboardAvoidingView, Platform, SafeAreaView,
  StyleSheet,
  Text, TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import PhoneInput from "./components/PhoneInput";
import { text } from "../../utils/mixins";
import RoundedButton from "../../components/RoundedButton";
import Colors from "../../utils/Colors";
import AgreementsBlock from "../../components/AgreementsBlock";
import Enum from "../../utils/enum";
import SText from "../../components/SText";
import CodeInput from "./components/CodeInput";
import { requestConfirmationCode, submitAuthCode } from "../../api";
import DataContext from "../../data/DataContext";
import ModalHeader from "../../components/ModalHeader";
import {useNavigation} from "@react-navigation/native";
import AppMetrica from "react-native-appmetrica";
import SBar from "../../components/SBar";

const [SIGN_IN, CONFIRM] = Enum(2)


const SignIn = ({onSubmit=()=>{}, initialPhone='', error='Произошла ошибка)', onDismissError=()=>{}}) => {
  const [phone, setPhone] = useState(initialPhone);
  const [agreed, setAgreed] = useState(true)

  async function handleSubmit () {
    await onSubmit(phone, agreed)
  }

  useEffect(()=>{
    if (phone.length < 18)
      onDismissError()
  }, [phone.length])


  return <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "position" : 'height'}
                          keyboardVerticalOffset={100}
    >
      <Text style={styles.topLabel}>{"ВВЕДИТЕ НОМЕР\nТЕЛЕФОНА"}</Text>
      <PhoneInput value={phone} onValueChange={setPhone} />
      <Text style={styles.bottomLabel}>{"На указанный номер мы отправим вам сообщение с 4-х значным кодом"}</Text>
      <RoundedButton label={"Отправить СМС"}
                     activeColor={Colors.mainGreen}
                     dimmedColor={Colors.mainGreenDimmed}
                     disabled={(phone?.length < 18)}
                     onPress={handleSubmit}
      />
      <SText style={styles.error} color={Colors.red} >{error}</SText>
    </KeyboardAvoidingView>
    <AgreementsBlock isAgreed={agreed} setAgreed={setAgreed} />
  </View>
  </TouchableWithoutFeedback>

}

const Confirm = ({phone='', onReenter=()=>{}, onSubmit=()=>{}, error='', onDismissError=()=>{}}) => {
  const [code, setCode] = useState('')

  useEffect(()=>{
    if (code.length === 4) {
      onSubmit(code)
    }
  }, [code])


  return <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "position" : 'height'}
                            keyboardVerticalOffset={100}
      >
        <Text style={styles.topLabel}>{'ПОДТВЕРДИТЕ НОМЕР\nТЕЛЕФОНА'}</Text>
        <SText fontSize={16} fontWeight={400} style={{textAlign: 'center'}}>
          {'Ваш номер'}
        </SText>
        <SText style={{textAlign: 'center', marginTop: 8}} fontSize={16} fontWeight={700}>
          {phone}
        </SText>
        <TouchableOpacity style={styles.enterPhoneAgain} onPress={onReenter}>
          <SText fontSize={12} fontWeight={700} color={'#BDBDBD'}>
            {'Ввести мой номер заново'}
          </SText>
        </TouchableOpacity>
        <Text style={styles.bottomLabel}>
          {"Мы отправили вам сообщение\n" +
          "с 4-х значным кодом. \n" +
          "Введите его в поле ниже"}
        </Text>
        <CodeInput value={code} onValueChange={setCode} onDismissError={onDismissError}/>
        <SText style={styles.error} color={Colors.red} >{error}</SText>
      </KeyboardAvoidingView>
    </View>
  </TouchableWithoutFeedback>
}

export default ()=>{
  const [screen, setScreen] = useState(SIGN_IN)
  const [initialPhone, setInitialPhone] = useState('')
  const [temporaryToken, setTemporaryToken] = useState('')
  const [error, setError] = useState('')

  const {auth, authorize} = useContext(DataContext)
  const {goBack} = useNavigation()

  async function onPhoneSubmit (phone, agreed) { //todo
    setInitialPhone(phone)
    AppMetrica.reportEvent('Попытка авторизации', {USER: phone, wantsMailing: agreed})
    setError('')
    const response = await requestConfirmationCode(phone, agreed)
    if (response?.token) {
      setTemporaryToken(response.token)
      setScreen(CONFIRM)
    } else {
      setError('Произошла ошибка. Попробуйте позднее.')
    }
  }

  function reenterPhone() {
    setScreen(SIGN_IN)
  }

  async function submitCode(code) { //todo
    setError('')
    const response = await submitAuthCode(code, temporaryToken)
    if (response?.token) {
      authorize(response.token)
      AppMetrica.reportEvent('Успешная авторизация', {USER: initialPhone})
    } else {
      setError('Ой, код неверный. Попробуйте еще раз')
    }
  }

  function getContent () {
    switch (screen) {
      case CONFIRM: return <Confirm phone={initialPhone} onReenter={reenterPhone} onSubmit={submitCode} error={error} onDismissError={()=>setError('')}/>
      case SIGN_IN: default: return <SignIn onSubmit={onPhoneSubmit} initialPhone={initialPhone} error={error} onDismissError={()=>setError('')}/>
    }
  }

  return <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
    <SBar/>
    <ModalHeader onClose={goBack}/>
    {getContent()}
  </SafeAreaView>

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 20,
    flex: 1,
    paddingTop: 68,
    justifyContent: "space-between",
  },
  topLabel: {
    ...text(20, 900, 3, true),
    textAlign: "center",
    marginBottom: 24,
  },
  bottomLabel: {
    ...text(18, 700, 2, true),
    textAlign: "center",
    marginTop: 24,
    marginBottom: 36,
  },
  enterPhoneAgain: {
    alignSelf: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#BDBDBD',
    marginTop: 12,
  },
  error: {
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
  }
})
