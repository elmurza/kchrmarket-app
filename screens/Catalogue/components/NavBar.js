import React, { useContext, useMemo } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Colors from "../../../utils/Colors";
import SText from "../../../components/SText";
import DataContext from "../../../data/DataContext";
import { useNavigation } from "@react-navigation/native";
import { RegionContext } from "../../../App";

const Badge = ({value, color}) => {
  if (Number(value) < 1) return null
  return <View style={{ ...styles.badge, backgroundColor: color }}>
    <SText fontWeight={500} color={'#fff'} fontSize={12}>{value}</SText>
  </View>
}

const NavButton = ({onPress=()=>{}, icon, image=false, badgeColor=Colors.darkBlue, badgeNumber=0}) => {

  return <TouchableOpacity onPress={onPress} activeOpacity={.8}>
    <Badge value={badgeNumber} color={badgeColor}/>
    <View style={styles.button}>
      <Image source={image || icon} style={image ? {width: 50, height: 50, borderRadius: 25} : {width: 30, height: 30}} resizeMode={'contain'}/>
    </View>
  </TouchableOpacity>
}
const NavBar = () => {

  const {cart, signOut, user} = useContext(DataContext)
  const {region, setRegion} = useContext(RegionContext)

  const {unpaidOrders} = useMemo(()=>{
    return {unpaidOrders: user.data?.orders?.filter(order=>order.status_payment == 0 && order.status !=='canceled')?.length}
  },[user.data?.orders])

  const {navigate} = useNavigation()

  const cartSize = useMemo(()=>{
    return cart.data?.productList?.length || 0
  }, [cart.data])

  return <View style={styles.container} pointerEvents={"box-none"}>
    <NavButton icon={!!user.data?.id ? require('../../../assets/images/User.png') : require('../../../assets/images/UserUnauth.png')}
               onPress={()=>navigate('UserModal')}
               badgeNumber={unpaidOrders}
               badgeColor={Colors.orange}/>
    <NavButton icon={require('../../../assets/images/Cart.png')}
               badgeNumber={cartSize}
               onPress={()=>navigate('CartModal')}/>
    <NavButton icon={require('../../../assets/images/Search.png')}
               onPress={()=>navigate('Search')}/>
  </View>
}

export default NavBar

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 25,
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
  },
  button: {
    height: 54,
    width: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    height: 22,
    minWidth: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 4,
    paddingTop: 2,
    paddingHorizontal: 3
  }
})






































