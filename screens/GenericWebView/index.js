import React from 'react'
import { useNavigation, useRoute } from "@react-navigation/native";
import { TouchableOpacity, StyleSheet, View, Image } from "react-native";
import SText from "../../components/SText";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { circle } from "../../utils/mixins";

const Header = ({title='', color='#fff', overrideGoBack=false, renderRight=()=>null}) => {
  const navigation = useNavigation()

  function onBackPress () {
    overrideGoBack ?
      overrideGoBack() :
      navigation.goBack()
  }
  return <View style={[styles.container, {backgroundColor: color}]}>
    <TouchableOpacity style={styles.sideArea} onPress={onBackPress}>
      <View style={circle(25, '#ccc')}>
        <Image source={require("../../assets/images/chevronLeft.png")}
                                    style={{ width: 10, height: 10 }} />
      </View>
    </TouchableOpacity>
    <View style={styles.title}>
      <SText fontSize={16} fontWeight={700} adjustsFontSizeToFit numberOfLines={1}>{title}</SText>
    </View>
    <TouchableOpacity style={styles.sideArea}>
      {renderRight()}
    </TouchableOpacity>
  </View>
}

const GenericWebView = () => {
  const {params} = useRoute()
  const {goBack} = useNavigation()

  const {url, title} = params

  const onMessage = (e) => {
    let data = decodeURIComponent(e.nativeEvent.data);
    if (data === 'CLOSE')
      goBack()
  }

  return <SafeAreaView style={{flex: 1}} edges={['top']}>
    <Header title={title} />
    <WebView onMessage={onMessage}
             decelerationRate={'normal'}
             contentInsetAdjustmentBehavior={'automatic'}
             containerStyle={{flex: 1}}
             source={{uri: url}}/>
  </SafeAreaView>

}

export default GenericWebView


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 53,
  },
  title: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideArea: {
    minWidth: 98,
    justifyContent: 'center',
    paddingHorizontal: 20
  }
})
