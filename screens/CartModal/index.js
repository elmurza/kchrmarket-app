import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  ImageBackground, Keyboard,
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  ScrollView, TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ModalHeader from "../../components/ModalHeader";
import { useNavigation } from "@react-navigation/native";
import SText from "../../components/SText";
import DataContext from "../../data/DataContext";
import ProductListItem from "./components/ProductListItem";
import Icon from "../../components/Icon";
import InputBorder from "../../components/InputBorder";
import RoundedButton from "../../components/RoundedButton";
import launchDialog from "../../components/Dialog";
import { useCoolDown } from "../../utils/hooks";
import Colors from "../../utils/Colors";
import Input from "../../components/Input";
import BottomModal from "../../components/BottomModal";
import ToggleButton, { CheckBox } from "../../components/Switch";
import moment from "moment";
import {dayFormat, inputFormat, modalHeight, targetFormat} from "../../config";
import { between, capitalize, removeYear } from "../../utils/other";
import { PriceRow, TotalRow } from "./components/TotalRow";
import IconButton from "../../components/IconButton";
import {text} from "../../utils/mixins";
import {RegionContext} from "../../App";
import Preloader from "../../components/Preloader";
import PaymentMethodSelector from "../../components/PaymentMethodSelector";
import AppMetrica from "react-native-appmetrica";
import SBar from "../../components/SBar";


function getExactErrorsText (orderErrors) {
  function getWord (name) {
    switch (name) {
      case 'address': return 'адрес'
      case 'name': return 'имя'
      case 'slot': return 'время доставки'
    }
  }

  const array = orderErrors.map(getWord)

  const last = array.length > 2 ? array.slice(-1) : null
  const first = array.slice(0, last ? array.length - 1 : array.length)
  const firstWords = array.slice(0, -2)
  const lastTwo = array.slice(-2)


  return firstWords.join(', ') +(!!firstWords.length ? ', ' : '') + lastTwo.join(' и ')

}


const CartModal = () => {
  const { goBack, navigate } = useNavigation();
  const { cart, userLocation, user, deliverySlots, makeOrder, catalogue, removePromoCode } = useContext(DataContext);
  const {isMigrating} = useContext(RegionContext)
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [promoCodeModalVisible, setPromoCodeModalVisible] = useState(false);
  const [orderErrors, setOrderErrors] = useState([])

  const [paymentMethod, setPaymentMethod] = useState({value: 'cash'})

  const scoresMax = useMemo(()=>Math.min(user.data?.scores || 0, Math.floor(((cart.data?.deliveryPrice || 0) + (cart.data?.basketAmount || 0))/2)), [user.data, cart.data])
  const [scores, setScores] = useState(scoresMax)

  const promoCodeUsed = !!cart.data?.promocode
  const [promoType, setPromoType] = useState(promoCodeUsed ? 'code' : 'none') // 'scores' | 'code'

  const hasAddress = !!userLocation.data?.address


  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
      }
    );

    deliverySlots.get()
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);




  useEffect(()=>{
    if (promoCodeUsed)
      setPromoType('code')
    else
      setPromoType('none')

  }, [promoCodeUsed])

  const scoresToUse = promoType === 'scores' ? scores : 0

  const [deliveryInfo, setDeliveryInfo] = useState({
    number: userLocation.data?.number,
    door: userLocation.data?.door,
    floor: userLocation.data?.floor,
    comment: userLocation.data?.comment,
  });

  useEffect(() => {
    setDeliveryInfo({
      number: userLocation.data?.number,
      door: userLocation.data?.door,
      floor: userLocation.data?.floor,
      comment: userLocation.data?.comment,
    });
  }, [
    userLocation.data?.number,
    userLocation.data?.door,
    userLocation.data?.floor,
    userLocation.data?.comment,
  ]);

  const [selectedDay, setSelectedDay] = useState(null); //todo first

  async function checkAndSubmitOrder () {
    if (!user.data?.id) {
      navigate('SignIn')
      return
    }

    if (cart.data?.basketAmount + cart.data?.amount_bonuses < catalogue.data.threshold) {
      goBack()
      return
    }
    let _errors = []
    if (!user.data.full_name)
      _errors = [..._errors, 'name']
    if (!userLocation.data.address)
      _errors = [..._errors, 'address']

    if (!!_errors.length) {
      setOrderErrors(_errors)
      return
    }

    const response = await makeOrder({paymentType: paymentMethod.value === 'cash' ? 1 : 3, deliverySlot: selectedInterval, scores: promoType === 'scores' ? scores : 0})
    if (!response?.id) {
      Alert.alert('Произошла ошибка, попробуйте еще раз')
      return
    }
    AppMetrica.reportEvent('Оформлен заказ', {orderId: response.id})

    goBack()
    cart.remove()
    navigate('OrderDetails', {id: response.id, askToRate: true})

  }


  const dayOptions = useMemo(() => {
    if (!deliverySlots.data?.slots) return [];
    const _options = deliverySlots.data?.slots?.reduce((options, slot) => {
      const isToday = moment(slot.start, inputFormat).isSame(moment(), "day");
      const isTomorrow = moment(slot.start, inputFormat).isSame(moment().add(1, "days"), "day");
      const label = `${isToday ? "Сегодня, " : (isTomorrow ? "Завтра, " : capitalize(moment(slot.start, inputFormat).format("dddd")) + ", ")}${moment(slot.start, inputFormat).format(dayFormat)}`;

      const val = moment(slot.start, inputFormat).format(dayFormat);
      if (options.findIndex(({ value }) => value === val) !== -1)
        return options;

      return [
        ...options,
        {
          label,
          value: moment(slot.start, inputFormat).format(dayFormat),
        },
      ];
    }, []);
    setSelectedDay(_options?.[0] || {});
    return _options;
  }, [deliverySlots.data?.slots]);

  const timeOptions = useMemo(() => {
    if (!deliverySlots.data?.slots) return [];
    return deliverySlots.data?.slots?.filter((slot) => {
      return moment(slot.start, inputFormat).isSame(moment(selectedDay?.value, dayFormat), "day");
    })?.map(slot => ({
      value: slot,
      from: moment(slot.start, inputFormat).format(targetFormat),
      to: moment(slot.end, inputFormat).format(targetFormat),
    }));

  }, [deliverySlots.data?.slots, selectedDay, dayOptions]);

  function onDaySelect(value) {
    setSelectedDay({ value });
  }

  const [selectedInterval, setSelectedInterval] = useState(null);


  useEffect(() => {
    setSelectedInterval(timeOptions?.[0]?.value);
  }, [timeOptions]);

  const [updateInfo, pending] = useCoolDown(userLocation.update, 600, true);

  const [name, setName] = useState(user.data?.full_name || "");

  useEffect(()=>{
    setOrderErrors(prev=>prev.filter(v=>v!=='name'))
  }, [user.data?.full_name])

  useEffect(()=>{
    setOrderErrors(prev=>prev.filter(v=>v!=='address'))
  }, [userLocation.data?.address])

  const updateName = useCoolDown((text) => user.update({ full_name: text }));

  function getSelectedIntervalLabel() {
    const dateTime = selectedInterval?.start
    const isToday = moment(dateTime, inputFormat).isSame(moment(), "day");
    const isTomorrow = moment(dateTime, inputFormat).isSame(moment().add(1, "days"), "day");
    const getLabel = () => {
      if (isToday)
        return 'Сегодня'
      if (isTomorrow)
        return "Завтра"
      return moment(dateTime, inputFormat).format(dayFormat)
    }

    const time = moment(dateTime, inputFormat).format('HH:mm')

    return `${removeYear(getLabel())} с ${time}`
  }


  useEffect(() => {
    if (name !== user.data?.full_name)
     updateName(name);
  }, [name]);

  useEffect(() => {
    setName(user.data?.full_name || "");
  }, [user.data?.full_name]);

  useEffect(() => {
    if (
      deliveryInfo.comment !== userLocation.data?.comment ||
      deliveryInfo.number !== userLocation.data?.number ||
      deliveryInfo.door !== userLocation.data?.door ||
      deliveryInfo.floor !== userLocation.data?.floor
    )
      updateInfo(deliveryInfo)

  }, [deliveryInfo]);

  function createSetter(name) {
    return (value) => setDeliveryInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  if (isMigrating) return <Preloader/>

  if (!cart.data?.productList?.length) return <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
    <SBar/>
    <ModalHeader onClose={goBack} />
    <ImageBackground style={{ paddingHorizontal: 20, flex: 1 }}
                     source={require("../../assets/images/cartEmptyState.png")}
                     resizeMode={"cover"}
    >
      <SText fontWeight={900} fontSize={34} style={{ marginVertical: 24 }}>{"КОРЗИНА"}</SText>
      <SText fontSize={24} gap={true} fontWeight={900}
             style={{ marginTop: 20 }}>{"В ВАШЕЙ КОРЗИНЕ\nПОКА ЧТО НЕТ\nТОВАРОВ"}</SText>
      <View style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 20 }}>
        <RoundedButton label={"К покупкам"} onPress={goBack} />
      </View>
    </ImageBackground>
  </SafeAreaView>;

  return <View style={{flex: 1}}>
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#fff" }}
                          behavior={Platform.OS === 'ios' ? "padding" : 'height'}
                          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 36}>
      <SafeAreaView style={{ flex: 1 }}>
        <ModalHeader onClose={goBack} />
        <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} keyboardShouldPersistTaps={"handled"}
                    keyboardDismissMode={"on-drag"}>
          <SText fontWeight={900} fontSize={34} style={{ marginVertical: 24 }}>{"КОРЗИНА"}</SText>
          <View style={{ borderBottomWidth: 1, borderBottomColor: "#ededed", marginBottom: 24, paddingBottom: 20 }}>
            {cart.data?.productList?.length ?
              cart.data?.productList.map(({ product_id, quantity, price }) => <ProductListItem key={product_id}
                                                                                               price={price}
                                                                                        productId={product_id}
                                                                                        amount={quantity} />) :
              null
            }
            {cart.data?.productList?.length ?
              <TouchableOpacity style={{ alignItems: "center", flexDirection: "row" }}
                                onPress={launchDialog({
                                  message: "Вы уверены, что хотите удалить все товары из вашей корзины?",
                                  textCancel: "Отмена",
                                  textOk: "Да, удалить товары",
                                  onOk: ()=> {
                                    removePromoCode()
                                    cart.remove()
                                  },
                                })}>
                <View style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: "#c7c7c7",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Icon iconSrc={require("../../assets/images/trashcan.png")} size={12} />
                </View>
                <SText fontSize={14} fontWeight={400} color={"#c7c7c7"}
                       style={{ marginLeft: 8 }}>{"Очистить корзину"}</SText>
              </TouchableOpacity> :
              null}
          </View>
          {!user.data?.id ?
              <>
                <SText fontWeight={500} fontSize={16} gap style={{marginBottom: 16, alignItems: 'center'}}>
                {'Для того, чтобы оформить покупки, пожалуйста, '}
                  <TouchableOpacity onPress={()=>navigate('SignIn')}
                                    style={{
                                      borderBottomWidth: 1,
                                      borderBottomColor: Colors.red,
                                      justifyContent: 'flex-end',
                                      transform: [{translateY: 2.5}]
                                    }}
                  >
                    <SText fontWeight={500}
                            fontSize={16}
                            color={Colors.red}
                    >
                    {'авторизуйтесь'}
                  </SText>
                  </TouchableOpacity>
                  {' с помощью вашего номера телефона. '}
              </SText>
                <SText fontSize={14} fontWeight={400} style={{marginBottom: 36}}>{'Это займёт менее 1 минуты'}</SText>
              </> :
              <View style={{marginBottom: 24, marginHorizontal: -4}}>
                <SText color={orderErrors.includes('name') ? Colors.red : "#c7c7c7"} fontSize={12} fontWeight={400}
                       style={{marginLeft: 4}}>{"Ваше имя"}</SText>
                <Input value={name} onValueChange={setName} error={orderErrors.includes('name')}/>
              </View>}
          <SText fontWeight={900} fontSize={30}>{"ДОСТАВКА:"}</SText>
          <View style={{ borderBottomWidth: 1, borderBottomColor: "#ededed", marginVertical: 12, paddingBottom: 20 }}>
            <TouchableOpacity onPress={() => navigate("Map")}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon iconSrc={require("../../assets/images/MapPinBlack.png")} size={24} />
                <SText fontWeight={500} fontSize={18} color={orderErrors.includes('address') ? Colors.red : Colors.darkBlue} style={{ flex: 1, marginLeft: 8 }}>
                  {hasAddress ? userLocation.data?.address : "Выбрать адрес"}
                </SText>
                <Icon iconSrc={require("../../assets/images/chevronRight.png")} size={11} style={{ marginLeft: 12 }} />
              </View>
            </TouchableOpacity>
            {(!hasAddress || !user.data?.id) ? null : <View style={{marginTop: 20, marginBottom: 32, paddingHorizontal: 32}}>
              <View style={{flexDirection: "row", width: "100%", marginBottom: 8}}>
                <InputBorder title={"Кв/офис"}
                             value={deliveryInfo.number}
                             onValueChange={createSetter("number")}
                             style={{flex: 1, marginRight: 8}}/>
                <InputBorder title={"Подъезд"}
                             value={deliveryInfo.door}
                             onValueChange={createSetter("door")}
                             style={{flex: 1, marginRight: 8}}/>
                <InputBorder title={"Этаж"}
                             value={deliveryInfo.floor}
                             onValueChange={createSetter("floor")}
                             style={{flex: 1}}/>
              </View>
              <InputBorder title={"Комментарий к заказу"}
                           style={{minHeight: 61}}
                           value={deliveryInfo.comment}
                           onValueChange={createSetter("comment")}/>
            </View>}
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginTop: 16}}
                              onPress={() => setTimeModalVisible(true)}
            >
              <Icon iconSrc={hasAddress ? require("../../assets/images/clock.png") : require("../../assets/images/clockGray.png")} size={24} />
              <SText fontWeight={500} color={hasAddress ? Colors.darkBlue : Colors.grayFont} fontSize={hasAddress ? 18 : 14} style={{ flex: 1, marginHorizontal: 8 }}>{hasAddress ? getSelectedIntervalLabel() : 'После ввода адреса, мы скажем ближайшее время доставки'}</SText>
              {hasAddress ? <View style={{ borderBottomWidth: 1, borderBottomColor: Colors.darkBlue }}>
                <SText fontWeight={500} fontSize={14}>
                  {"Выбрать"}
                </SText>
              </View> : null}
              {!hasAddress ? null : <Icon iconSrc={require("../../assets/images/chevronRight.png")} size={11} style={{marginLeft: 12}}/>}
            </TouchableOpacity>
          </View>

          {!user.data?.id ? null : <View>
            <TouchableOpacity style={{
              flexDirection: 'row',
              marginTop: 12,
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: promoType === 'scores' ? .4 : 1
            }}
                              onPress={() => setPromoCodeModalVisible(true)}
                              disabled={promoType === 'scores'}
            >
              <SText fontSize={18} fontWeight={700}>{'Промокод'}</SText>
              <SText style={{flex: 1, marginLeft: 8, marginTop: 2}} fontSize={12} fontWeight={500}>{cart.data?.desc || ''}</SText>
              <IconButton
                  icon={promoCodeUsed ? require('../../assets/images/check.png') : require('../../assets/images/chevronRightWhite.png')}
                  color={promoCodeUsed ? Colors.mainGreen : Colors.orange}
                  onPress={() => setPromoCodeModalVisible(true)}
                  disabled={promoType === 'scores'}
              />
            </TouchableOpacity>
            <SText fontWeight={400} fontSize={14} color={Colors.grayShape}
                   style={{marginVertical: 24}}>{'Вы можете применить промокод\nили использовать баллы'}</SText>
            <View style={{flexDirection: 'row', alignItems: 'center', opacity: promoType === 'code' ? .4 : 1}}>
              <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                <SText fontSize={18} fontWeight={700}>{"Потратить баллы"}</SText>
                <TextInput underlineColorAndroid={"transparent"}
                           keyboardType={"number-pad"}
                           value={scores.toString()}
                           onChangeText={(text) => setScores(between(0, Number(text), scoresMax))}
                           style={{
                             backgroundColor: "#ededed",
                             minWidth: 50,
                             paddingHorizontal: 6,
                             maxWidth: 100,
                             paddingVertical: 6,
                             textAlign: "center",
                             borderRadius: 4,
                             marginLeft: 12,
                             ...text(18, 700)
                           }}/>
              </View>
              <ToggleButton isOn={promoType === 'scores'}
                            disabled={promoType === 'code'}
                            colors={{backgroundOn: Colors.orange}}
                            onToggle={() => {
                              promoType === 'scores' ? setPromoType('none') : setPromoType('scores')
                            }}
              />
            </View>
          </View>}

          <View style={{marginTop: 32}}>
            <PriceRow name={'Стоимость товаров'} amount={cart.data?.basketAmount + cart.data?.amount_bonuses}/>
            <PriceRow name={'Стоимость доставки'} amount={cart.data?.deliveryPrice} free/>
            <PriceRow name={'Скидка'} amount={-(cart.data?.amount_bonuses + scoresToUse)}/>
            <TotalRow name={'Итог'} amount={cart.data?.deliveryPrice + cart.data?.basketAmount - scoresToUse}/>
          </View>

          <View style={{marginTop: 32}}>
            <SText fontWeight={500} fontSize={14}>{'Способ оплаты'}</SText>
            <TouchableOpacity onPress={()=>setPaymentModalVisible(true)} style={{flexDirection: 'row', alignItems: 'center', marginTop: 12}}>
              <Icon iconSrc={paymentMethod.value === 'new_card' ? require('../../assets/images/newCard.png') : require('../../assets/images/cashPayment.png')}/>
              <SText fontWeight={700}
                     style={{marginHorizontal: 12, flex: 1}}
                     fontSize={18}>{paymentMethod.value === 'new_card' ? 'Банковской картой' : 'Наличными курьеру'}</SText>
              <IconButton icon={require('../../assets/images/chevronRightWhite.png')} color={Colors.orange}/>
            </TouchableOpacity>
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>

      </SafeAreaView>
    </KeyboardAvoidingView>

    <BottomModal isOpen={timeModalVisible} onClose={() => setTimeModalVisible(false)} height={modalHeight}>
      <TimeIntervalModal onClose={() => setTimeModalVisible(false)}
                         dayOptions={dayOptions}
                         timeOptions={timeOptions}
                         onDaySelect={onDaySelect}
                         onSelectInterval={setSelectedInterval}
                         selectedDay={selectedDay}
                         selectedInterval={selectedInterval}
      />
    </BottomModal>

    <BottomModal isOpen={promoCodeModalVisible} onClose={()=>setPromoCodeModalVisible(false)} height={350}>
      <PromoCodeModal onClose={()=>setPromoCodeModalVisible(false)}/>
    </BottomModal>

    <PaymentMethodSelector isOpen={paymentModalVisible}
                           selected={paymentMethod}
                           onSelect={setPaymentMethod}
                           onClose={()=>setPaymentModalVisible(false)}
    />

    {isKeyboardVisible ? null : <View style={{ position: "absolute", bottom: 0, padding: 20, paddingBottom: 40, left: 0, width: "100%" }}>
      {!!orderErrors.length ? <View style={{
        alignSelf: "center",
        backgroundColor: "#fff",
        padding: 4,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
      }}>
        <SText color={Colors.red} fontSize={13}
               fontWeight={500}>{"Заполните красные поля: " + getExactErrorsText(orderErrors)}</SText>
      </View> : null}
      <RoundedButton label={!user.data?.id ? 'Авторизоваться' : cart.data?.basketAmount + cart.data?.amount_bonuses < catalogue.data.threshold ?
        `Нужно еще добавить на ${Math.ceil(catalogue.data.threshold - (cart.data?.basketAmount + cart.data?.amount_bonuses))} ₽` :
        "Оформить"}
                     onPress={checkAndSubmitOrder}
                     dimmedColor={Colors.darkBlue} />
    </View>}
  </View>;
};

const PromoCodeModal = ({onClose = ()=>{}}) => {
  const {cart, appendPromoCode, removePromoCode} = useContext(DataContext)

  const [value, setValue] = useState(cart.data?.promocode || '')
  const [error, setError] = useState(false)

  function onValueChange (text) {
    setValue(text)
    setError(false)
  }

  async function tryPromoCode () {
    if (value === '') {
      await removePromoCode()
      onClose()
      return
    }

    const response = await appendPromoCode(value)
    if (response.verified) {
      onClose()
    } else {
      setError(true)
    }
  }

  return <View style={{flex: 1, backgroundColor: '#fff'}}>
    <View style={{flex: 1}}>
      <SText fontWeight={900} fontSize={20} style={{ marginTop: 12 }}>{"ПРОМОКОД"}</SText>
      <SText fontWeight={500} fontSize={16}
             style={{ marginVertical: 24 }}>{"Впишите в строке ниже ваш промокод"}</SText>
      <Input placeholder={"Промокод"} value={value} onValueChange={onValueChange}/>
      <SText color={Colors.red} fontWeight={700} fontSize={12} style={{marginTop: 12}} gap>{error ? 'Промокод неверный.\nПожалуйста, попробуйте еще раз' : ''}</SText>
    </View>
    <RoundedButton label={'Подтвердить'} onPress={tryPromoCode}/>
  </View>
}

const TimeIntervalModal = ({
                             onClose = () => {},
                             dayOptions = [],
                             timeOptions = [],
                             onDaySelect = () => {},
                             onTimeSelect = () => {},
                             selectedDay,
                             selectedInterval,
                             onSelectInterval,
                             selectedTime,
                           }) => {
  const dayCarousel = useRef(null)

  const {cart} = useContext(DataContext)
  const deliveryPrice = cart.data?.deliveryPrice

  useEffect(()=>{
    const index = dayOptions.findIndex(item=>item?.value === selectedDay.value) || 0
    setTimeout(()=>{
      dayCarousel.current && dayCarousel.current.scrollToIndex({
        animated: true,
        index,
        viewOffset: 20,
      });
    }, 400)
  }, [selectedDay])

  return <View style={{ backgroundColor: "#fff", flex: 1 }}>
    <SText fontWeight={900} fontSize={20} style={{ marginTop: 12 }}>
      {"ВЫБРАТЬ ВРЕМЯ ДОСТАВКИ"}
    </SText>
    <FlatList data={dayOptions}
              horizontal
              ref={dayCarousel}
              onScrollToIndexFailed={()=>{}}
              keyExtractor={(item)=>item.value}
              style={{ marginHorizontal: -20, marginVertical: 24, maxHeight: 40 }}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: 0 }} />}
              ListHeaderComponent={() => <View style={{ width: 20 }} />}
              ListFooterComponent={() => <View style={{ width: 20 }} />}
              renderItem={({ item, index }) => (
                <TouchableOpacity style={{
                  backgroundColor: selectedDay.value === item.value ? Colors.darkBlue : "#fff",
                  height: 40,
                  paddingHorizontal: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 20,
                }}
                                  onPress={() => onDaySelect(item.value)}
                >
                  <SText fontWeight={400} fontSize={14}
                         color={selectedDay.value === item.value ? "#fff" : Colors.darkBlue}>{removeYear(item.label)}</SText>
                </TouchableOpacity>
              )} />
    <SText>{"Выбор времени:"}</SText>
    <FlatList data={timeOptions}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item)=>item.start}
              renderItem={({ item, index }) => (
      <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12 }}
                        activeOpacity={1}
                        onPress={() => onSelectInterval(item.value)}>
        <SText fontWeight={700} fontSize={18} style={{ flex: 1 }}>{item?.from + ' - ' + item?.to}</SText>
        <SText fontWeight={500} fontSize={18} color={deliveryPrice == 0 ? Colors.mainGreen : Colors.darkBlue} style={{ marginRight: 12 }}>{deliveryPrice == 0 ? 'бесплатно' : deliveryPrice+' ₽'}</SText>
        <CheckBox isOn={selectedInterval?.start === item?.value?.start} onToggle={() => onSelectInterval(item.value)} />
      </TouchableOpacity>
    )}
              style={{ flex: 1 }}
    />
    <RoundedButton label={"Выбрать"} onPress={onClose} />
  </View>;
};

export default CartModal;

