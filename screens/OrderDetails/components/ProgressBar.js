import React from 'react'
import { StyleSheet, View } from "react-native";
import { circle } from "../../../utils/mixins";
import { isAsync } from "@babel/core/lib/gensync-utils/async";
import Icon from "../../../components/Icon";
import Colors from "../../../utils/Colors";
import SText from "../../../components/SText";

function insertBetween(array, element){
  return [...array].map((e, i) => i < array.length - 1 ? [e, element] : [e]).reduce((a, b) => a.concat(b))
}

const statuses = [
  {
    label: 'принят',
    icon: null,
    iconActive: require('../../../assets/images/orderStatuses/acceptedWhite.png')
  },
  {
    label: 'собран',
    icon: require('../../../assets/images/orderStatuses/packedGray.png'),
    iconActive: require('../../../assets/images/orderStatuses/packedWhite.png')
  },
  {
    label: 'передан\nна доставку',
    icon: require('../../../assets/images/orderStatuses/inDeliveryGray.png'),
    iconActive: require('../../../assets/images/orderStatuses/inDeliveryWhite.png')
  },
  {
    label: 'доставлен',
    icon: require('../../../assets/images/orderStatuses/doneGray.png'),
    iconActive: require('../../../assets/images/orderStatuses/doneWhite.png')
  },
]

const ProgressLine = ({ isActive }) => {
  return <View style={{ ...styles.line, backgroundColor: isActive ? Colors.mainGreen : '#ededed' }}/>
}

const ProgressPoint = ({isActive, point}) => {
  return <View style={styles.pointContainer}>
    <View style={{ ...styles.point, backgroundColor: isActive ? Colors.mainGreen : '#ededed' }}>
      <Icon iconSrc={isActive ? point.iconActive : point.icon} size={32}/>
    </View>
    <SText color={isActive ? Colors.mainGreen : '#ededed'}
           fontSize={12}
           fontWeight={500}
           style={styles.pointLabel}
    >{point.label}</SText>
  </View>
}

const ProgressBar = ({activeIndex=-1}) => {

  if (activeIndex < 0) return null

  function getIsActive (pointIndex) {
    return pointIndex <= activeIndex
  }

  // cringe
  return <View style={styles.container}>
    <ProgressPoint point={statuses[0]} isActive={getIsActive(0)}/>
    <ProgressLine isActive={getIsActive(1)}/>
    <ProgressPoint point={statuses[1]} isActive={getIsActive(1)}/>
    <ProgressLine isActive={getIsActive(2)}/>
    <ProgressPoint point={statuses[2]} isActive={getIsActive(2)}/>
    <ProgressLine isActive={getIsActive(3)}/>
    <ProgressPoint point={statuses[3]} isActive={getIsActive(3)}/>
  </View>
}

export default ProgressBar

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 42
  },
  point: {
    ...circle(53, '#ededed')
  },
  pointContainer: {
  },
  line: {
    flex: 1,
    height: 3,
    backgroundColor: '#ededed',
    marginHorizontal: 4,
  },
  pointLabel: {
    textAlign: 'center',
    position: 'absolute',
    top: 60,
    width: 80,
    alignSelf: 'center',
  }
})
