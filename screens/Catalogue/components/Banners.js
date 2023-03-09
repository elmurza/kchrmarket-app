import React, { useContext } from "react";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import { bannerHeight, bannerWidth, screenDims } from "../../../config";
import Colors from "../../../utils/Colors";
import { useNavigation } from "@react-navigation/native";
import DataContext from "../../../data/DataContext";
import FastImage from "react-native-fast-image";


const renderItem = (item, scrollFunc=()=>{}) => {
  return <Item item={item} scrollFunc={scrollFunc}/>
}

const Item = ({item, scrollFunc}) => {
  const {navigate} = useNavigation()

  function onPress () {
    if (item.product_id) {
      navigate("ProductModal", { productId: item.product_id })
    } else if (item.category_id) {
      scrollFunc(item.category_id)
    }
  }

  return <TouchableOpacity onPress={onPress}
                           style={{width: bannerWidth*.9, height: bannerHeight*.9, overflow: 'hidden', backgroundColor: '#fff'}}>
    <FastImage source={{uri: item.image_mob }} style={{height: bannerHeight*.9, width: bannerWidth*.9, borderRadius: 18}} resizeMode={'cover'}/>
  </TouchableOpacity>
}


const Banners = ({scrollFunc}) => {
  const {banners} = useContext(DataContext)


  return <FlatList data={banners.data}
                   style={{height: bannerHeight, backgroundColor: '#fff'}}
                   contentContainerStyle={{alignItems: 'flex-end'}}
                   horizontal={true}
                   showsHorizontalScrollIndicator={false}
                   decelerationRate={"fast"}
                   snapToInterval={bannerWidth*.9+10}
                   ListHeaderComponent={()=><View style={{width: 15}}/>}
                   ListFooterComponent={()=><View style={{width: 15}}/>}
                   ItemSeparatorComponent={()=><View style={{width: 10}}/>}
                   renderItem={({item})=>renderItem(item, scrollFunc)}/>
}

export default Banners
