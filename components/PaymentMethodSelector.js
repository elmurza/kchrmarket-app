import React, { useContext, useMemo, useRef } from "react";
import { FlatList, Image, TouchableWithoutFeedback, View, StyleSheet } from "react-native";
import BottomModal from "./BottomModal";
import DataContext from "../data/DataContext";
import SText from "./SText";
import { CheckBox } from "./Switch";
import { screenDims } from "../config";
import Colors from "../utils/Colors";
import RoundedButton from "./RoundedButton";

const defaultMethods = [
  {
    label: 'Банковской картой',
    value: 'new_card',
    icon: require('../assets/images/newCard.png')
  },
  {
    label: 'Наличными курьеру',
    value: 'cash',
    icon: require('../assets/images/cashPayment.png')
  },
]

function getCardIcon (type) {
  switch (type) {
    case 'Visa': return require('../assets/images/visa.png')
    case 'MasterCard': return require('../assets/images/masterCard.png')
    case 'Maestro': return require('../assets/images/maestro.png')
    case 'Mir': return require('../assets/images/mir.png')
    default: return require('../assets/images/visa.png')
  }
}

const PaymentMethodCard = ({icon, label, isSelected = false, onSelect = () => {}}) => {
  return <TouchableWithoutFeedback onPress={onSelect}>
    <View style={{...styles.methodContainer, ...(isSelected ? styles.selected : styles.deselected)}}>
      <View style={styles.methodHeader}>
        <Image source={icon} style={{width: 30, height: 24}} resizeMode={'contain'}/>
        <CheckBox isOn={isSelected} onToggle={()=>onSelect()} colors={{backgroundOn: Colors.orange}}/>
      </View>
      <View style={styles.methodBody}>
        <SText style={styles.title} fontWeight={700} fontSize={14}>{label}</SText>
      </View>
    </View>
  </TouchableWithoutFeedback>
}


const PaymentMethodSelector = ({onClose=()=>{}, selected, onSelect=()=>{}}) => {
  const {user, paymentMethod} = useContext(DataContext)

  const cards = [] //user.data?.cards || []

  const methods = useMemo(()=>{
    return [
      ...cards.map(card=>({
        value: 'card_'+card.id,
        cardId: card.id,
        label: card.number,
        icon: getCardIcon(card.type)
      })),
      ...defaultMethods
    ]
  }, [cards])

  //const selected = paymentMethod.data || methods[0]

  //const onSelect = (item) => paymentMethod.update(item)

  const flatList = useRef()
  return <View>
      <SText fontWeight={900} fontSize={20} style={{marginBottom: 18, paddingHorizontal: 20}}>{'ВЫБОР СПОСОБА ОПЛАТЫ'}</SText>
      <FlatList data={methods}
                ref={flatList}
                snapToInterval={12+(screenDims.width * 0.6)}
                initialScrollIndex={methods.findIndex(item=>item.value === selected?.value)}
                onScrollToIndexFailed={()=>{}}
                initialNumToRender={20}
                style={{paddingHorizontal: 4, paddingVertical: 16}}
                ItemSeparatorComponent={()=><View style={{width: 12}}/>}
                ListHeaderComponent={()=><View style={{width: 20}}/>}
                ListFooterComponent={()=><View style={{width: 20}}/>}
                decelerationRate={"fast"}
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                renderItem={({item})=>
                  <PaymentMethodCard label={item.label}
                                     onSelect={()=>onSelect(item)}
                                     icon={item.icon}
                                     isSelected={item.value === selected?.value}
                  />}
      />
    <View style={{padding:20}}>
      <RoundedButton label={"Сохранить"} onPress={onClose} />
    </View>
  </View>
}

export default ({isOpen=false, onClose=()=>{}, ...props}) => (
  <BottomModal height={320} isOpen={isOpen} onClose={onClose} customStyle={{paddingHorizontal: 0}}>
    <PaymentMethodSelector {...props} onClose={onClose}/>
  </BottomModal>
)


const styles = StyleSheet.create({
  methodContainer: {
    borderRadius: 8,
    width: screenDims.width * .6,
    height: 90,
    paddingHorizontal: 12,
    paddingTop: 12,
    marginBottom: 12,
  },
  selected: {
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
  deselected: {
    backgroundColor: '#ededed',
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 28,
  },
  methodBody: {
    paddingTop: 4
  },
  selectButton: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderColor: '#c1c1c1',
    borderWidth: 0.5,
    alignItems: 'center',
  }
})
