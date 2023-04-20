import React, {useContext, useEffect, useMemo, useState} from "react";
import { FlatList, Keyboard, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import ModalHeader from "../../components/ModalHeader";
import {useNavigation} from "@react-navigation/native";
import SearchInput from "./components/SearchInput";
import DataContext from "../../data/DataContext";
import SText from "../../components/SText";
import Icon from "../../components/Icon";
import useSearch from "../../data/SearchContext";
import ProductCard from "../Catalogue/components/ProductCard";
import { DOMAIN_URL } from "../../config";
import SBar from "../../components/SBar";

const Search = ({}) => {
    const {query, onQueryChange, suggestions} = useSearch()
    const {navigate} = useNavigation()
    const {goBack} = useNavigation()
    const {catalogue, getProductSync} = useContext(DataContext)

    const categories = useMemo(()=>{
        return catalogue.data.categories.map(category=>({
            id: category.id,
            firstSubCat: category.firstSubCat,
            name: category.name,
            image: category.image_pc
        }))
    }, [catalogue.data?.categories])

    function goBackAndScroll (id) {
        navigate('Catalogue', {scrollTo: {sectionId: id}})
    }

    return <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <SBar/>
        <ModalHeader onClose={goBack}/>
        <View style={{paddingHorizontal: 20, paddingVertical: 16, flex: 1}}>
            <View style={{paddingBottom: 12}}>
                <SearchInput value={query} onValueChange={onQueryChange}/>
            </View>
            {query == '' ?
                <FlatList data={categories}
                          keyboardShouldPersistTaps={"always"}
                          keyboardDismissMode={"on-drag"}
                          onScrollBeginDrag={Keyboard.dismiss}
                          style={{marginTop: 16, flex: 1}}
                          renderItem={({item}) => <TouchableOpacity style={styles.item}
                                                                    onPress={() => goBackAndScroll(item.firstSubCat, item.id)}>
                              <Icon iconSrc={{ uri: DOMAIN_URL + item.image }} size={340} style={{marginRight: 8, borderRadius: 15, marginVertical: -80, marginHorizontal: -10}}/>
                              <SText fontSize={18} fontWeight={900}>
                                  {item?.name?.toUpperCase() || ''}
                              </SText>
                          </TouchableOpacity>}
                /> :
                <ScrollView
                    keyboardShouldPersistTaps={"always"}
                    keyboardDismissMode={"on-drag"}
                    onScrollBeginDrag={Keyboard.dismiss}
                    style={{flex: 1}}
                >
                    {suggestions.autocomplete.slice(0, 3).map(item => (
                        <TouchableOpacity style={styles.autocompleteItem} key={item} onPress={()=>onQueryChange(item)}>
                            <SText fontSize={18} fontWeight={400}>{item}</SText>
                        </TouchableOpacity>
                    ))}
                    <View style={styles.grid}>
                        {suggestions.products.map((product) => {
                            return <ProductWrapper id={product.id} key={product.id}/>
                        })}
                    </View>
                </ScrollView>
            }

        </View>
    </SafeAreaView>
}

const ProductWrapper = ({id}) => {
    const [data, setData] = useState(null)
    const {getProductByEcoId} = useContext(DataContext)

    useEffect(()=>{
        const product = getProductByEcoId(id)
        setData(product)
    }, [id])

    if (!data) return null

    return <ProductCard product={data}/>
}

export default Search

const styles = StyleSheet.create({
    item: {
        // flexDirection: 'row',
        paddingVertical: 2,
        alignItems: 'center',
    },
    autocompleteItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#ededed',
        paddingVertical: 16,
        paddingHorizontal: 12
    },
    grid: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
})
