import React, { useContext, useEffect, useState } from "react";
import { Image, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import SText from "../../components/SText";
import { useNavigation, useRoute } from "@react-navigation/native";
import IconButton from "../../components/IconButton";
import FastImage from "react-native-fast-image";
import DataContext from "../../data/DataContext";
import { DOMAIN_URL, screenDims } from "../../config";
import NearestDelivery from "./components/NearestDelivery";
import LinearGradient from "react-native-linear-gradient";
import Preloader from "../../components/Preloader";
import AmountSelector from "./components/AmountSelector";
import ModalHeader from "../../components/ModalHeader";
import Colors from "../../utils/Colors";
import StrikedView from "../../components/StrikedView";
import { useWaiting } from "../../utils/hooks";
import { round } from "../../utils/other";
import WebView from "react-native-webview";
import SBar from "../../components/SBar";


const BADGE_HEIGHT = 34

const Badge = ({source}) => {
  const [width, setWidth] = useState(0)

  useEffect(()=>{
    const {width: w, height: h} = Image.resolveAssetSource(source)
    setWidth(w * (BADGE_HEIGHT / h))

  }, [source])


  return <View>
    <Image style={{ ...styles.badgeImage, width }} resizeMode={'contain'} width={width} source={source}/>
  </View>
}

function renderBadges(product) {
  const badges = [];
  const pr = product || {};
  const has = (val) => parseInt(val) === 1;
  const badge = (field, file) => has(pr[field]) && badges.push(file) ;

  badge("freeze", require("../../assets/images/productBadges/freeze.png"));
  badge("new", require("../../assets/images/productBadges/new.png"));
  badge("week", require("../../assets/images/productBadges/week.png"));
  badge("preparation", require("../../assets/images/productBadges/almost_ready.png"));
  badge("grain", require("../../assets/images/productBadges/grain.png"));


  return <View style={{
    flexDirection: "column",
    position: "absolute",
    top: -17,
    left: 0,
  }}>
    {badges.map(source => <Badge source={source} />)}
  </View>;
}

const ProductModal = ({}) => {
  const {params} = useRoute()
  const {goBack} = useNavigation()
  const {catalogue, auth, cart, getProduct} = useContext(DataContext)
  const [product, setProduct] = useState(null)
  const [currentAmount, setCurrentAmount] = useState(0)
  const [webViewHeight, setWebViewHeight] = useState(50)

  const discount = product?.old_price &&
    Math.floor(100 - (product.price / product.old_price * 100))

  const sum = Math.max(1, currentAmount) * product?.price

  const oldSum = discount &&
    Math.max(1, currentAmount) * product?.old_price


  async function _loadProduct () {
    const _product = await getProduct(params.productId)
    if (!_product) {
      setTimeout(goBack, 1000)
      throw '404'
    }
    setProduct(_product)
  }

  const [waiting, loadProduct] = useWaiting(_loadProduct)

  useEffect(()=>{
    loadProduct()
  },[params.productId, cart.data])

  useEffect(()=>{
    const _currentAmount = cart.data?.productList?.find(({product_id})=>product_id == params.productId)?.quantity || 0
    setCurrentAmount(_currentAmount)

  }, [cart.data])

  function onAmountChange (amount) {
    cart.update(params.productId, amount)
    setCurrentAmount(amount)
  }

  const htmlBody = `
    <style>
      body {
       font-size: 36px;
       font-family: sans-serif;
       height: min-content;
     }
     br {
      content: "";
      margin: 2em;
      display: block;
      font-size: 24%;
    }
    </style>
    <body>
    ${product?.description}
    </body>
  `

  const webViewScript = `
  setTimeout(function() { 
    window.ReactNativeWebView.postMessage(document.querySelector('body').scrollHeight); 
  }, 500);
  true; // note: this is required, or you'll sometimes get silent failures
`

  if (!product) return <SafeAreaView  style={{flex: 1, backgroundColor: '#fff'}}>
    <ModalHeader onClose={goBack}/>
    <Preloader/>
  </SafeAreaView>

  return <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
    <SBar/>
  <ModalHeader onClose={goBack}/>
    <ScrollView style={{padding: 20, paddingBottom: 70, flex: 1}}>
      <FastImage source={{uri: product.big_image}}
                 style={{
                   width: screenDims.width - 40,
                   height: screenDims.width - 40,
                   backgroundColor: '#ededed',
                   borderRadius: 6
                 }}
      />
      {renderBadges(product)}
      <SText fontWeight={900} style={{marginVertical: 20}} fontSize={26}>
        {product?.title}
      </SText>
      <SText fontWeight={700} fontSize={14}>
        {product?.weight +' кг'}
      </SText>
      <NearestDelivery/>
      <WebView source={{html: htmlBody}}
               scrollEnabled={false}
               useWebKit={true}
               automaticallyAdjustContentInsets={false}
               javaScriptEnabled={true}
               injectedJavaScript={webViewScript}
               domStorageEnabled={true}
               onMessage={e=>{
                 setWebViewHeight(parseInt(e.nativeEvent.data) / 2.6)
               }}
               containerStyle={{height: webViewHeight}}
      />
      {/*<SText fontWeight={400} fontSize={14} gap={true}>{fixDescription(product?.description)}</SText>*/}
      <View style={{height: 40}}/>
    </ScrollView>
    <LinearGradient colors={['#ffffff00', '#FFFFFFFF']} style={{height: 35, marginTop: -35}}/>
    <View style={{height: 108, flexDirection: 'row', alignItems: 'stretch', padding: 20}}>
      <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
        <View>
          {discount ? <View style={{ flexDirection: "row",
            marginRight: 8,
            alignItems: 'center',
            paddingBottom: 6 }}>
            <StrikedView>
              <SText fontSize={16} fontWeight={500} color={"#bdbdbd"}>{Math.floor(oldSum)}</SText>
              <SText fontSize={14} fontWeight={400} color={"#bdbdbd"}>
                {' ₽'}
              </SText>
            </StrikedView>
            <View style={{
              backgroundColor: Colors.mainGreen,
              paddingHorizontal: 4,
              paddingVertical: 3,
              marginLeft: 11,
              borderRadius: 6}} >
              <SText color={'#fff'} fontSize={16} fontWeight={700}>{`-${discount}%`}</SText>
            </View>
          </View>  : null}
          <View style={{ flexDirection: "row", marginRight: 8 }}>
            <SText fontSize={28} fontWeight={900} style={{alignSelf: 'flex-end'}}>{Math.floor(sum)}</SText>
            <SText fontSize={18} fontWeight={700} style={{alignSelf: 'center'}}>
              {' ₽'}
            </SText>
            <SText fontWeight={500} fontSize={14} style={{alignSelf: 'center'}}>
              {' за ' + (product.ed_izm !== 'кг' ? Math.max(1, currentAmount)+' шт' :  round(Math.max(1, currentAmount) * product.weight) + ' '+product.ed_izm)}
            </SText>
          </View>
        </View>
      </View>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <AmountSelector amount={currentAmount}
                        onQuickChange={setCurrentAmount}
                        limit={product?.availableones}
                        onSubmit={onAmountChange}/>
      </View>
    </View>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  badgeImage: {
    height: BADGE_HEIGHT,
    alignSelf: 'flex-start',
    marginBottom: 4
  },
  badgeColumn: {
    flexDirection: 'column',
    position: 'absolute',
    top: -12,
    left: 0,
    zIndex: 1000,
  }
})

export default ProductModal
