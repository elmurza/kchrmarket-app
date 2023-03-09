import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import DataContext from "../../data/DataContext";
import { SectionList, View, Animated, ScrollView, Text, PanResponder, Platform } from "react-native";
import SText from "../../components/SText";
import {
  bannerHeight, CARD_HEIGHT,
  CATEGORY_CAROUSEL, CATEGORY_FONTSIZE,
  CATEGORY_TITLE,
  DELIVERY_BLOCK_HEIGHT,
  screenDims,
  SUBCATEGORY_CAROUSEL, SUBCATEGORY_FONTSIZE, SUBCATEGORY_TITLE
} from "../../config";
import CatalogueCarousel, { SubCatalogueCarousel } from "../../components/CatalogueCarousel";
import sectionListGetItemLayout from "react-native-section-list-get-item-layout";
import NavBar from "./components/NavBar";
import ProductCard from "./components/ProductCard";
import Banners from "./components/Banners";
import DeliveryInfo from "./components/DeliveryInfo";
import {useRoute} from "@react-navigation/native";
import SBar from "../../components/SBar";




const getItemLayout = (data, index) => {
  const cb = sectionListGetItemLayout({
    listHeaderHeight: bannerHeight + DELIVERY_BLOCK_HEIGHT + CATEGORY_CAROUSEL + SUBCATEGORY_CAROUSEL,
    getSectionHeaderHeight: index => {
      const section = data[index]
      const categoryHeight = section.isFirst ? getTitleHeight(section.parentName, CATEGORY_TITLE, CATEGORY_FONTSIZE) : 0
      const subCategoryHeight = !section.isOnly ? getTitleHeight(section.name, SUBCATEGORY_TITLE, SUBCATEGORY_FONTSIZE) : 0
      return categoryHeight + subCategoryHeight
    },
    getItemHeight: (rowData, sectionIndex, rowIndex) => rowIndex % 2 ? 0 : CARD_HEIGHT,
  });
  return cb(data, index);
};

const Catalogue = ({}) => {
  const { catalogue, ...rest } = useContext(DataContext);
  const {params} = useRoute()
  const listRef = useRef(null);
  const [currentSection, setCurrentSection] = useState({ id: -1, parentId: -1 });
  const [isRefreshing, setRefreshing] = useState(false)


  const offset = useRef(new Animated.Value(0)).current

  const onScroll = Animated.event([{
    nativeEvent: {contentOffset: {y: offset}}
  }], {useNativeDriver: true})

  async function onRefresh () {
    setRefreshing(true)
    await catalogue.get()
    setRefreshing(false)
  }

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    const currentSection = viewableItems[1]?.section;
    if (currentSection?.id) {
      setCurrentSection({ id: currentSection.id, parentId: currentSection.parentId || currentSection.id });
    }
  }, []);

  useEffect(()=>{
    if (params?.scrollTo) {
      scrollToSection(params.scrollTo?.sectionId, params.scrollTo?.catId)
    }
  }, [params?.scrollTo])

  function scrollToSection(sectionId, catId) {
    if (listRef.current) {
      setCurrentSection(prev => ({ id: sectionId, parentId: catId || prev.parentId }));
      listRef.current.scrollToLocation({
        sectionIndex: catalogue.data.indexes[sectionId],
        animated: false,
        viewOffset: CATEGORY_CAROUSEL + SUBCATEGORY_CAROUSEL + 4,
        itemIndex: 0,
      });
    }
  }

  if (!catalogue.data?.allSubCategories)
    return null


  return <View style={{ flex: 1 }}>
    <SBar darkContent/>
    <Animated.View
      style={{
      position: "absolute",
      transform: [{ translateY: offset.interpolate({ inputRange: [0, bannerHeight + DELIVERY_BLOCK_HEIGHT], outputRange: [bannerHeight+DELIVERY_BLOCK_HEIGHT, 0], extrapolateRight: 'clamp' }) }],
      top: 0,
      left: 0,
      zIndex: 100,
      opacity: 1,
    }}>
      <CatalogueCarousel selected={currentSection.parentId}
                         categories={catalogue.data?.categories}
                         onSelect={scrollToSection} />
      <SubCatalogueCarousel selected={currentSection.id} onSelect={scrollToSection}
                            categories={catalogue.data?.allSubCategories} />
    </Animated.View>
    <Animated.SectionList
      ref={listRef}
      overScrollMode={'never'}
      ListHeaderComponent={<ListHeader scrollToSection={scrollToSection}/>}
      //onRefresh={onRefresh}
      onScroll={onScroll}
      scrollEventThrottle={16}
      //refreshing={isRefreshing}
      style={{ flex: 1, backgroundColor: "#fff", }}
      removeClippedSubviews={true}
      sections={catalogue.data?.allSubCategories}
      onViewableItemsChanged={onViewableItemsChanged}
      renderSectionHeader={renderSectionHeader}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 100 / screenDims.height * 100 }}
      keyExtractor={(item, index) => item.id}
      stickySectionHeadersEnabled={false}
      windowSize={11}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={16}
      ListFooterComponent={<View style={{height: 100}}/>}
    />
    <NavBar />
  </View>;
};

function getTitleHeight (title='', baseHeight, fontSize=30) {
  const containerWidth = screenDims.width - 40
  const charWidthApprox = fontSize * 0.76

  let lines = Math.ceil(title.length * charWidthApprox / containerWidth)
  if (lines > 1 && fontSize < CATEGORY_FONTSIZE) lines ++ // t.me/labtorie я все объясню...)
  return lines * baseHeight
}
const renderSectionHeader = ({ section }) => (

    <View style={{paddingHorizontal: 20}}>
      {section.isFirst ?
          <View style={{
            height: getTitleHeight(section.parentName, CATEGORY_TITLE, CATEGORY_FONTSIZE),
            width: "100%",
            alignItems: "flex-end",
            flexDirection: 'row',
          }}>
            <SText fontWeight={900} fontSize={CATEGORY_FONTSIZE} style={{flex: 1}} gap>
              {section.parentName?.toUpperCase()}
            </SText>
          </View> :
          null}
      {section.isOnly ? null : <View style={{
        height: getTitleHeight(section.name, SUBCATEGORY_TITLE, SUBCATEGORY_FONTSIZE),
        width: "100%",
        alignItems: "flex-start",
        flexDirection: 'row',
      }}>
        <SText fontWeight={900} fontSize={SUBCATEGORY_FONTSIZE} color={section.color} style={{flex: 1}} gap>
          {section.name?.toUpperCase()}
        </SText>
      </View>}
    </View>
);

const renderItem = ({ section, index }) => {

  if (index % 2 !== 0) return null;

  const items = [];

  for (let i = index; i < index + 2; i++) {
    if (i >= section.data.length) {
      break;
    }
    items.push(<ProductCard product={section.data[i]} key={i} />);
  }

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        height: CARD_HEIGHT,
        paddingHorizontal: 20,
      }}
    >
      {items}
    </View>
  );
};

const ListHeader = ({scrollToSection=()=>{}}) => {
  return <View style={{height: bannerHeight + DELIVERY_BLOCK_HEIGHT + CATEGORY_CAROUSEL+SUBCATEGORY_CAROUSEL}}>
    <Banners scrollFunc={scrollToSection}/>
    <View style={{paddingHorizontal: 20}}>
      <DeliveryInfo />
      <View style={{ height: CATEGORY_CAROUSEL + SUBCATEGORY_CAROUSEL }} />
    </View>
  </View>
}


export default Catalogue;

