import React, { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import RoundedButton from "../../../components/RoundedButton";
import Colors from "../../../utils/Colors";
import SText from "../../../components/SText";
import { vibrate } from "../../../utils/other";

const AmountSelector = ({
                          amount=0,
                          onQuickChange=console.log,
                          onSubmit=console.log,
                          limit=10
}) => {
  const [displayAmount, setDisplayAmount] = useState(amount) // for instant feedback
  const [timer, setTimer] = useState(0)
  const [isCartButtonSuspended, setCartButtonSuspended] = useState(false)

  useEffect(()=>{
    setDisplayAmount(amount)
  }, [amount])


  function handleChange (delta = 1) {
    vibrate()
    timer && clearTimeout(timer)
    const newAmount = Math.max(0, Math.min(displayAmount+delta, limit))

    if (newAmount === 0) {
      setCartButtonSuspended(true)
      setTimeout(()=>setCartButtonSuspended(false), 500)
    }

    setDisplayAmount(newAmount)
    onQuickChange(newAmount)

    const _timer = setTimeout(()=>{
      onSubmit(newAmount)
    }, 700)
    setTimer(_timer)
  }

  if (displayAmount === 0) {
    return <RoundedButton onPress={()=>handleChange(1)}
                          disabled={isCartButtonSuspended}
                          dimmedColor={'rgba(33,49,64,0.79)'}
                          containerStyle={{height: 50, maxWidth: 170}}>
      <Image source={require('../../../assets/images/addToCard.png')} style={{height: 34}} resizeMode={'contain'}/>
    </RoundedButton>
  }

  return <>
    {limit == amount ?
      <SText fontSize={14}
             fontWeight={700}
             style={{ left: 34, position: "absolute", top: -6 }}
      >
        {"Это максимум"}
      </SText> : null}
    <View style={styles.container}>
    <TouchableOpacity style={styles.button}
                      onLongPress={() => handleChange(-displayAmount)}
                      onPress={() => handleChange(-1)}>
      <SText color={"#fff"} fontSize={26}>―</SText>
    </TouchableOpacity>
    <View style={styles.numberHolder}>
      <SText fontWeight={500} fontSize={26}>{displayAmount}</SText>
    </View>
    <TouchableOpacity style={styles.button}
                      onPress={() => handleChange(1)}>
      <SText color={"#fff"} fontSize={48}>+</SText>
    </TouchableOpacity>
  </View>
  </>
}

export default AmountSelector

const styles = StyleSheet.create({
  container: {
    height: 50,
    maxHeight: 50,
    maxWidth: 170,
    flex: 1,
    flexDirection: 'row',
    borderRadius: 25,
    backgroundColor: Colors.grayBackground
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.mainGreen,
  },
  numberHolder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
})
