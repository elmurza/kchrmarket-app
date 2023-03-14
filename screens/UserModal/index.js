import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import ModalHeader from "../../components/ModalHeader";
import { useNavigation } from "@react-navigation/native";
import SText from "../../components/SText";
import BottomModal from "../../components/BottomModal";
import RoundedButton from "../../components/RoundedButton";
import Input from "../../components/Input";
import DataContext from "../../data/DataContext";
import { circle, text } from "../../utils/mixins";
import Colors from "../../utils/Colors";
import Icon from "../../components/Icon";
import PromoDescription from "./components/PromoDescription";
import { onContactSupport } from "./utils";
import SupportButton from "../../components/SupportButton";
import PaymentMethodSelector from "../../components/PaymentMethodSelector";
import SBar from "../../components/SBar";
import launchDialog from "../../components/Dialog";
import { deleteUser } from "../../api";
import AsyncStorage from "@react-native-community/async-storage";

const EditButton = ({onPress=()=>{}}) => { // todo вынести в переиспользуемую кнопку
  return <TouchableOpacity style={styles.button} onPress={onPress}>
    <Icon iconSrc={require('../../assets/images/penDark.png')} size={14}/>
  </TouchableOpacity>
}

const EditNameModal = ({prevName='', onSubmit, isOpen, onClose}) => {

  const [value, setValue] = useState(prevName)

  useEffect(()=>{
    setValue(prevName)
  }, [prevName, isOpen])



  return <BottomModal height={256}
                      onClose={onClose}
                      isOpen={isOpen}>
    <View style={{flex: 1}}>
      <SText fontSize={16} fontWeight={500}>{"Ваше имя:"}</SText>
      <Input value={value} onValueChange={setValue} placeholder={"Введите имя"} />
    </View>
      <RoundedButton containerStyle={{ alignSelf: "center", width: 218 }}
                     onPress={()=>onSubmit(value)}
                     disabled={value?.trim()?.length < 2}
                     label={'Сохранить'}/>
  </BottomModal>
}

const UserModal = () => {

  const codeValue = 300
  const {goBack, navigate} = useNavigation()
  const [isNameModalVisible, setNameModalVisible] = useState(false)
  const [promoDescVisible, setPromoDescVisible] = useState(false)

  const {user, signOut, userLocation} = useContext(DataContext)

  const code = user.data?.personal_promocode

  const address = userLocation.data?.address

  const [methodsModalVisible, setMethodsModalVisible] = useState(false)

  async function onShare () {
    try {
      const result = await Share.share({
        title: 'Поделитесь вашим промокодом',
        message:
          `Привет, вот ${codeValue} бонусных рублей на доставку продуктов от сервиса https://kchrmarket.ru. Воспользуйся промокодом «${code}» и передай другому!`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
    }
  }

  const {totalOrders, unpaidOrders} = useMemo(()=>{
    //todo
    return {totalOrders: user.data?.orders?.length, unpaidOrders: user.data?.orders?.filter(order=>order.status_payment == 0 && order.status !=='canceled')?.length}
  },[user.data?.orders])

  const isNameExist = user.data?.full_name?.length

  async function updateName (newName) {
    await user.update({full_name: newName})
    setNameModalVisible(false)
  }

  if (!user.data?.id) {
    goBack()
    navigate('SignIn')
  }

  async function initiateAccountDeletion () {
    await deleteUser()
    signOut()
   // await sendRequest('disableUser', {apikey: user.apikey})
    //dispatch(signOut())
  }

  function onAccountDeletePress () {
    launchDialog({
      title: 'Вы собираетесь удалить ваш аккаунт',
      message: 'Ваши данные, включая ваши адреса, платежные карты, историю заказов и бонусных начислений, будут удалены!',
      textOk: 'Я понимаю',
      propsOk: {style: 'destructive'},
      textCancel: 'Отмена',
      onOk: launchDialog({
        title: 'Вы действительно хотите безвозвратно удалить ваш аккаунт?',
        textOk: 'Да, удалить',
        onOk: initiateAccountDeletion,
        propsOk: {style: 'destructive'},
        textCancel: 'Отмена'
      })
    })()
  }

  return <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
    <SBar/>
    <EditNameModal isOpen={isNameModalVisible}
                   onClose={()=>setNameModalVisible(false)}
                   onSubmit={updateName}
                   prevName={user?.data?.full_name || ''}
    />

    <PaymentMethodSelector isOpen={methodsModalVisible}
                           onClose={()=>setMethodsModalVisible(false)}
    />

    <PromoDescription isVisible={promoDescVisible}
                      onClose={()=>setPromoDescVisible(false)}
    />

      <ModalHeader onClose={goBack}/>
      <ScrollView style={{flex: 1, padding: 20}}>

        <View style={{flexDirection: 'row'}}>
          <View style={{ flexDirection: "row", flex: 1, alignItems: "center", marginBottom: 8 }}>
           <SText fontWeight={900}
                  fontSize={isNameExist ? 34 : 24}
                  color={isNameExist ? Colors.darkBlue : Colors.mainGreen}
                  style={{ marginRight: 14 }}
           >
             {user?.data?.full_name || 'КАК ВАС ЗОВУТ?'}
           </SText>
            <View style={{flex: 1, justifyContent: 'center'}}>
              <EditButton onPress={() => setNameModalVisible(true)} />
            </View>
          </View>
        </View>
        <View>
          <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
            <SText fontWeight={500} fontSize={14} color={'#c7c7c7'} style={{marginRight: 14}}>
              {user?.data?.phone || ''}
            </SText>
          </View>
        </View>

        {user.data?.isPolled === 0 && <View style={{
          flexDirection: "row",
          alignSelf: "flex-start",
          backgroundColor: "#eee",
          borderRadius: 4,
          padding: 10,
          marginTop: 20,
        }}>
          <View style={{ marginRight: 8 }}>
            <Image style={{ height: 20, width: 20 }} source={require("../../assets/images/glitter-cone.png")} />
          </View>
          <View>
            <SText fontWeight={900} fontSize={14} color={Colors.mainGreen}>{"Заполните анкету и получите"}</SText>
            <SText fontWeight={900} fontSize={22} gap color={Colors.mainGreen}>{"1200 бонусов"}</SText>
            <TouchableWithoutFeedback onPress={async () => {
              const token = await AsyncStorage.getItem('token')
              goBack();
              navigate("WebView", { title: "Анкета", url: "https://kchrmarket.ru/closer?standalone=true&apikey="+token });
            }}>
              <SText fontWeight={500} fontSize={14}
                     style={{ marginTop: 6, textDecorationLine: "underline" }}>
                {"Перейти к анкете >>"}
              </SText>
            </TouchableWithoutFeedback>
          </View>
        </View>}

        <View style={{marginVertical: 16}}>
          <SText fontSize={14} fontWeight={500}>{'На личном счёте:'}</SText>
          <SText fontWeight={900} fontSize={28} style={{marginVertical: 4}}>{`${user.data?.scores} бонусов`}</SText>
          <SText fontWeight={500} fontSize={14} color={'#c7c7c7'} gap>{'Ими можно оплатить до 50% заказа.\nСгорают по истечении 30 дней.'}</SText>
        </View>

        <View style={{borderBottomWidth: 1, borderColor: '#ededed', paddingBottom: 12}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <SText fontWeight={500} style={{marginRight: 12}}>{'Ваш промокод для друзей:'}</SText>
            <TouchableOpacity style={styles.button} onPress={()=>setPromoDescVisible(true)}>
              <Icon iconSrc={require('../../assets/images/i.png')} size={13}/>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 8}}>
            <TextInput style={styles.codeInput}
                       value={code}
                       editable={false}
                       selectTextOnFocus={true}
                       underlineColorAndroid={'transparent'}/>
            <RoundedButton containerStyle={{width: 53, height: 53}} onPress={onShare} async={false}>
              <Icon iconSrc={require('../../assets/images/share.png')} size={23}/>
            </RoundedButton>
          </View>
        </View>

        <View style={{borderBottomWidth: 1, borderColor: '#ededed', paddingVertical: 20}}>
          <SText fontWeight={500}>{'Адрес доставки:'}</SText>
          <TouchableOpacity onPress={()=>navigate('Map')}
            style={{flexDirection: 'row', alignItems: 'center', marginVertical: 12}}>
            <SText style={{flex: 1}} fontWeight={700} fontSize={18}>
              {address || 'Выбрать адрес'}
            </SText>
            <View style={{...styles.button, backgroundColor: Colors.orange}}>
              <Icon iconSrc={require('../../assets/images/chevronRightWhite.png')} size={11}/>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{borderBottomWidth: 1, borderColor: '#ededed', paddingVertical: 20}}>
          <SupportButton onPress={onContactSupport}/>
        </View>


        <View style={{borderBottomWidth: 1, borderColor: '#ededed', paddingVertical: 4}}>
          <TouchableOpacity style={styles.menuItem} onPress={()=>navigate('OrderHistory')}>
            <SText fontWeight={700} fontSize={18}>{'История заказов'}</SText>
            {totalOrders ?
              <View style={{ ...circle(24, "#ededed", true), marginLeft: 8, paddingHorizontal: 4 }}>
              <SText fontSize={14} fontWeight={400} color={"#909090"} style={{ marginTop: 2 }}>{totalOrders}</SText>
            </View> : null}

            {unpaidOrders ?
              <View style={{ ...circle(24, Colors.red, true), marginLeft: 8, paddingHorizontal: 4 }}>
              <SText fontSize={14} fontWeight={400} color={"#fff"} style={{ marginTop: 2 }}>{unpaidOrders}</SText>
            </View> : null}
          </TouchableOpacity>
         {/* <TouchableOpacity style={styles.menuItem} todo
                            onPress={()=>setMethodsModalVisible(true)}
          >
            <SText fontWeight={700} fontSize={18}>{'Способы оплаты'}</SText>
          </TouchableOpacity>*/}
        </View>

        <View style={{paddingBottom: 40}}>
          <TouchableOpacity style={styles.menuItem} onPress={()=>{Linking.openURL('https://seasonmarket.ru/the-agreements-and-rules')}}>
            <SText fontWeight={500} fontSize={14} color={'#909090'} style={{marginRight: 14}}>
              {'Политика конфиденциальности'}
            </SText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}
                            onPress={()=>{goBack(); signOut()}}>
            <SText fontWeight={700} fontSize={18} color={Colors.red} style={{marginRight: 14}}>
              {'Выйти'}
            </SText>
          </TouchableOpacity>
        </View>
        <View>
          <SText fontSize={12} fontWeight={500} color={'#4a4a4a'}>
            {'Вы можете полностью '}
            <TouchableWithoutFeedback onPress={onAccountDeletePress}>
              <SText fontSize={12} fontWeight={500} color={Colors.red}>
                {'удалить свой аккаунт,'}
              </SText>
            </TouchableWithoutFeedback>
            {' включая ваши персональные и платежные данные'}
          </SText>
        </View>

      </ScrollView>
  </SafeAreaView>
}

export default UserModal

const styles = StyleSheet.create({
  button: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ededed'
  },
  codeInput: {
    flex: 1,
    backgroundColor: '#eee',
    height: 59,
    borderRadius: 4,
    marginRight: 16,
    paddingHorizontal: 16,
    ...text(18, 400)
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18
  },

})
