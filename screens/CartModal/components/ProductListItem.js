import React, { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import DataContext from "../../../data/DataContext";
import { useNavigation } from "@react-navigation/native";
import SText from "../../../components/SText";
import StrikedView from "../../../components/StrikedView";
import { round, vibrate } from "../../../utils/other";


const AmountSelector = ({amount, handleChange=()=>{}, limit=0}) => {
  return <View style={{width: 100, flexDirection: 'row'}}>
    <TouchableOpacity style={styles.amountButton} onPress={()=>handleChange(-1)} onLongPress={()=>handleChange(-amount)}>
      <Image source={require('../../../assets/images/minusBlack.png')} style={{width: 12}} resizeMode={'contain'}/>
    </TouchableOpacity>
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <SText fontWeight={500} fontSize={16}>{amount}</SText>
    </View>
    <TouchableOpacity style={{ ...styles.amountButton, opacity: amount == limit ? .5 : 1 }} onPress={()=>handleChange(1)} disabled={amount == limit}>
      <Image source={require('../../../assets/images/plusBlack.png')} style={{width: 12}} resizeMode={'contain'}/>
    </TouchableOpacity>
  </View>
}

const ProductListItem = ({productId, amount=1, price}) => {
  const [data, setData] = useState(null)
  const {getProduct, cart, catalogue} = useContext(DataContext)
  const {navigate} = useNavigation()

  const [displayAmount, setDisplayAmount] = useState(amount) // for instant feedback
  const [timer, setTimer] = useState(0)

  function onSubmit (newAmount) {
      cart.update(productId, newAmount)
  }

  useEffect(()=>{
    setDisplayAmount(amount)
  }, [amount])


  function handleChange (delta = 1) {
    vibrate()
    timer && clearTimeout(timer)
    const newAmount = Math.max(0, Math.min(displayAmount+delta, data.availableones))


    setDisplayAmount(newAmount)

    const _timer = setTimeout(()=>{
      onSubmit(newAmount)
    }, 200)
    setTimer(_timer)
  }


  async function loadData () {
    const product = catalogue.data?.products?.find(product=>product.id == productId)
    if (product)
      setData(product)
    else {
      const response = await getProduct(productId)
      setData(response)
    }
  }

  useEffect(()=>{
    loadData()
  }, [productId])

  if (!data) return <View style={{height: 52+35}}/>

  const sum = Math.max(1, amount) * price;

  const oldSum =  data.old_price && Math.max(1, amount) * data?.old_price;

  if (displayAmount == 0) return null


  return <View style={{flexDirection: 'row', marginBottom: 35}}>
    <TouchableOpacity onPress={()=>navigate("ProductModal", { productId: productId })}>
      <FastImage source={{ uri: data.medium_image }} style={{ width: 52, height: 52, marginRight: 12, borderRadius: 6 }} />
    </TouchableOpacity>
    <View style={{flex: 1, justifyContent: 'space-between'}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{flex: 1, marginRight: 8}}>
          <SText fontSize={16} fontWeight={500} style={{marginBottom: 4}} numberOfLines={3}>
            {data?.title || ''}
          </SText>
        </View>
        <View>
          <AmountSelector amount={displayAmount} handleChange={handleChange} limit={data?.availableones}/>
        </View>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <SText fontSize={14} fontWeight={700} color={'#909090'}>
          { round((data?.weight || 0) * amount)+' кг'}{/*{data?.ed_izm === 'шт' ? amount+' шт' : round((data?.weight || 0) * amount) + ' '+ data.ed_izm}*/}
        </SText>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {oldSum ?
            <View style={{ marginRight: 8, flexDirection: 'row'}}>
              <StrikedView>
                <SText fontSize={16} fontWeight={700} color={"#909090"}>
                  {Math.floor(oldSum)}
                </SText>
              </StrikedView>
            </View> : null
          }

          <View style={{ flexDirection: "row", alignItems: 'center', marginRight: 8 }}>
            <SText fontSize={18} fontWeight={700}>{Math.floor(sum)}</SText>
            <SText fontSize={14} fontWeight={500}>
              {' ₽'}
            </SText>
          </View>
        </View>
      </View>
    </View>
  </View>
}

export default ProductListItem

const styles = StyleSheet.create({
  amountButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EDEDED',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
