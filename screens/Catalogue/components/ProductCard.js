import { useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import DataContext from "../../../data/DataContext";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import {CARD_HEIGHT, cardImageSize} from "../../../config";
import FastImage from "react-native-fast-image";
import SText from "../../../components/SText";
import Colors from "../../../utils/Colors";
import RoundedButton from "../../../components/RoundedButton";
import AmountSelector from "./AmountSelector";
import StrikedView from "../../../components/StrikedView";
import { vibrate } from "../../../utils/other";


const BADGE_HEIGHT = 26

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

  badge("freeze", require("../../../assets/images/productBadges/freeze.png"));
  badge("new", require("../../../assets/images/productBadges/new.png"));
  badge("week", require("../../../assets/images/productBadges/week.png"));
  badge("preparation", require("../../../assets/images/productBadges/almost_ready.png"));
  badge("grain", require("../../../assets/images/productBadges/grain.png"));


  return <View style={{
    flexDirection: "column",
    position: "absolute",
    top: -13,
    left: 0,
  }}>
    {badges.map(source => <Badge source={source} />)}
  </View>;
}


const ProductCard = ({ product }) => {

  const { navigate } = useNavigation();

  const { cart } = useContext(DataContext);

  useEffect(() => {
    const _currentAmount = cart.data?.productList?.find(({ product_id }) => product_id == product.id)?.quantity || 0;
    setCurrentAmount(_currentAmount);
  }, [product.id, cart.data]);


  const [currentAmount, setCurrentAmount] = useState(0);
  const [timer, setTimer] = useState(0);


  function handleChange(delta = 1) {
    vibrate()

    timer && clearTimeout(timer);
    const newAmount = Math.max(0, Math.min(currentAmount + delta, product?.availableones || 10));

    setCurrentAmount(newAmount);

    const _timer = setTimeout(() => {
      cart.update(product.id, newAmount);
    }, 400);

    setTimer(_timer);
  }

  const sum = Math.max(1, currentAmount) * product?.price;

  const oldSum = product.old_price && Math.max(1, currentAmount) * product?.old_price;

  return <TouchableOpacity onPress={() => navigate("ProductModal", { productId: product.id })}
                           disabled={product?.availableones == 0}
                           style={{ height: CARD_HEIGHT, width: cardImageSize, paddingVertical: 16, paddingHorizontal: 5, }}>
    <>
      <View style={{ flex: 1, alignItems: "center", opacity: product?.availableones == 0 ? .4 : 1 }}>
        <View style={{ width: cardImageSize, height: cardImageSize, marginBottom: 12 }}>
          <FastImage style={{ width: cardImageSize, height: cardImageSize, borderRadius: 4, backgroundColor: '#ededed' }}
                     source={{ uri: product?.medium_image, priority: FastImage.priority.high }}
                     resizeMode={FastImage.resizeMode.cover}

          />
          {renderBadges(product)}
          <AmountSelector currentAmount={currentAmount} handleChange={handleChange} limit={Number(product?.availableones)}/>
        </View>
        <View style={{ width: "100%", paddingHorizontal: 0, flex: 1 }}>
          <View style={{ width: "100%", flex: 1 }}>
            <SText fontSize={16} fontWeight={500} numberOfLines={2}>{product.title}</SText>
            <SText fontSize={14} fontWeight={700} color={"#909090"}
                   style={{ marginVertical: 4 }}>{product.weight + " кг"}</SText>
          </View>


          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>

            <View>
              {oldSum ?
              <View style={{ marginRight: 8, marginBottom: 1, flexDirection: 'row', alignItems: 'center'}}>
                <StrikedView strikeColor={Colors.red}>
                  <SText fontSize={14} fontWeight={700} color={"#909090"}>
                  {Math.floor(oldSum) + " ₽"}
                </SText>
                </StrikedView>
                <View style={{backgroundColor: Colors.mainGreen, marginLeft: 8, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2}}>
                  <SText color={'#fff'} fontWeight={700}>
                    {Math.floor(- 100 + (sum / oldSum) * 100) + '%'}
                  </SText>
                </View>
              </View> : <View style={{ marginRight: 8, marginBottom: 4, flexDirection: 'row'}}><SText fontSize={14} fontWeight={700}>{''}</SText></View>
              }

              <View style={{ flexDirection: "row", alignItems: 'center', marginRight: 8 }}>
                <SText fontSize={22} fontWeight={700}>{Math.floor(sum)}</SText>
                {/*<SText fontSize={12} fontWeight={500}>
                  {(sum % 1)?.toFixed(2)?.split(".")?.[1] || "00"}
                </SText>*/}
                <SText fontSize={18} fontWeight={500} style={{marginTop: 1, marginLeft: 2}}>{"₽"}</SText>
              </View>
            </View>
            <RoundedButton onPress={() => {
              handleChange(1);
            }}
                           disabled={false}
                           activeColor={currentAmount > 0 ? Colors.mainGreen : Colors.darkBlue}
                           dimmedColor={"rgba(33,49,64,0.79)"}
                           containerStyle={{ height: 50, maxWidth: 50 }}>
              <Image source={currentAmount > 0 ?
                require("../../../assets/images/plus.png") :
                require("../../../assets/images/addToCard.png")
              }
                     style={{ height: 20 }}
                     resizeMode={"contain"} />
            </RoundedButton>
          </View>
        </View>
      </View>
    </>
  </TouchableOpacity>;
};

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

export default ProductCard
