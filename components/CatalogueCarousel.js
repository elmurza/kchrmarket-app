import React, { useContext, useEffect, useRef } from "react";
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import SText from "./SText";
import Colors from "../utils/Colors";
import { CATEGORY_CAROUSEL, DOMAIN_URL, SUBCATEGORY_CAROUSEL } from "../config";

import FastImage from "react-native-fast-image";
import { vibrate } from "../utils/other";

export const images = [
  require('../assets/images/categories/almostDone.png'),
  require('../assets/images/categories/discount.png'),
  require('../assets/images/categories/bread.png'),
  require('../assets/images/categories/chicken.png'),
  require('../assets/images/categories/fish.png'),
  require('../assets/images/categories/fruits.png'),
  require('../assets/images/categories/grocery.png'),
  require('../assets/images/categories/meat.png'),
  require('../assets/images/categories/milk.png'),
]

const imagesA = [
  require('../assets/images/categories/almostDoneA.png'),
  require('../assets/images/categories/discountA.png'),
  require('../assets/images/categories/breadA.png'),
  require('../assets/images/categories/chickenA.png'),
  require('../assets/images/categories/fishA.png'),
  require('../assets/images/categories/fruitsA.png'),
  require('../assets/images/categories/groceryA.png'),
  require('../assets/images/categories/meatA.png'),
  require('../assets/images/categories/milkA.png'),
]

const CatalogueItem = ({name = '', icon, iconActive, id, isActive=false, onSelect=()=>{}}) => {
  if (name === '') return null

  return <TouchableOpacity onPress={onSelect}>
    <View style={styles.itemContainer}>
      <View style={{ ...styles.iconWrapper, backgroundColor: isActive ? Colors.darkBlue : Colors.grayBackground }}>
        <FastImage style={styles.icon}
               resizeMode={'contain'}
               source={{ uri: isActive ? DOMAIN_URL + iconActive : DOMAIN_URL + icon }} />
      </View>
      <SText style={{textAlign: 'center', marginHorizontal: -4}}
             fontWeight={500}
             numberOfLines={3}
             fontSize={11}
      >{name}</SText>
    </View>
  </TouchableOpacity>
}

const CatalogueCarousel = ({onSelect=()=>{}, selected, categories}) => {
  const catsRef = useRef(null)


  useEffect(()=>{
    const selectedIndex = categories.findIndex(({id})=>id === selected)
    if (selectedIndex >= 0 && selectedIndex <= categories.length-1 && catsRef.current) {
      catsRef.current.scrollToIndex({index: selectedIndex, animated: true, viewOffset: 40})
    }
  },[selected])


  return <View style={styles.container}>
    <FlatList data={categories}
              horizontal={true}
              ref={catsRef}
              style={{flex: 1}}
              initialNumToRender={50}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingHorizontal: 20, paddingTop: 8}}
              ItemSeparatorComponent={()=><View style={{width: 10}}/>}
              keyExtractor={((item, index) => item.id)}
              renderItem={({ item, index }) => (
                <CatalogueItem key={item?.id}
                               icon={item.image_mob}
                               id={item?.id}
                               iconActive={item.image_mob_active}
                               name={item.name}
                               onSelect={()=>onSelect(item.firstSubCat, item.id)}
                               isActive={selected === item.id}
                />
              )} />
  </View>;
}

const SubCatalogueItem = ({name='', isActive=false, onSelect=()=>{}, color=Colors.darkBlue}) => {
  return <TouchableOpacity style={{ ...styles.subCatContainer, backgroundColor: isActive ?  color : '#ffffff00'}} onPress={onSelect}>
    <SText color={isActive ? '#FFF' : Colors.darkBlue}>
      {name}
    </SText>
  </TouchableOpacity>
}

export const SubCatalogueCarousel = ({onSelect=()=>{}, selected, categories, subIndex}) => {
  const catsRef = useRef(null)

  useEffect(()=>{
    vibrate('impactLight')
    const selectedIndex = categories.findIndex(({id})=>id === selected)
    if (selectedIndex >= 0 && selectedIndex <= categories.length-1 && catsRef.current) {
      catsRef.current.scrollToIndex({index: selectedIndex, animated: true, viewOffset: 40})
    }
  },[selected, categories])

  if (categories.length < 2) return null

  return <View style={{ ...styles.container, height: SUBCATEGORY_CAROUSEL, maxHeight: SUBCATEGORY_CAROUSEL }}>
    <FlatList data={categories}
              horizontal={true}
              ref={catsRef}
              onScrollToIndexFailed={(error)=>{
                if (catsRef.current) {
                  catsRef.current.scrollToOffset({offset: 0})
                }
              }}
              style={{flex: 1}}
              showsHorizontalScrollIndicator={false}
              initialNumToRender={200}
              contentContainerStyle={{paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center'}}
              ItemSeparatorComponent={()=><View style={{width: 10}}/>}
              keyExtractor={((item, index) => ''+item.id+item.name+index)}
              renderItem={({ item, index }) => (
                <SubCatalogueItem name={item.name}
                                  color={item.color}
                                  onSelect={()=>onSelect(item.id)}
                                  isActive={selected === item.id}/>
              )} />
  </View>;
}

export default CatalogueCarousel

const styles = StyleSheet.create({
  itemContainer: {
    width: 58,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 54,
    height: 54,
    backgroundColor: Colors.grayBackground,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  container: {
    backgroundColor: '#fffffffa',
    height: CATEGORY_CAROUSEL,
    justifyContent: 'flex-start',
    //paddingVertical: 8,
  },
  subCatContainer: {
    height: 36,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
