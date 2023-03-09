import React, {useContext, useEffect, useState} from "react";
import {TouchableOpacity, View} from "react-native";
import FastImage from "react-native-fast-image";
import SText from "../../../components/SText";
import DataContext from "../../../data/DataContext";
import {round} from "../../../utils/other";
import {useNavigation} from "@react-navigation/native";

const OrderProduct = ({id, amount, price}) => {

    const [product, setProduct] = useState(null)
    const [loaded, setLoaded] = useState(false)
    const {getProduct} = useContext(DataContext)
    const {navigate} = useNavigation()

    async function loadProduct () {
        setLoaded(false)
        const response = await getProduct(id)
        setProduct(response)
        setLoaded(true)
    }

    useEffect(()=>{
        loadProduct()
    }, [id])

    if (!loaded) return null

    return <View style={{flexDirection: 'row', marginBottom: 12, opacity: product?.id ? 1 : .6}}>
        <TouchableOpacity onPress={()=>navigate("ProductModal", { productId: id })} disabled={!product?.id}>
            <FastImage style={{width: 52, height: 52, borderRadius: 6, marginRight: 12, backgroundColor: '#ededed'}}
                       source={{uri: product?.medium_image}}
            />
        </TouchableOpacity>
        <View style={{flex: 1}}>
            <SText fontWeight={500} fontSize={16} style={{marginBottom: 6, marginRight: 12}} gap>
                {product?.title || 'Товар не найден'}
            </SText>
            <SText fontWeight={700} fontSize={14} color={'#909090'}>
                {round((product?.weight || 1) * Number(amount)) + (product?.weight ? ' кг' : ' шт')}
            </SText>
        </View>
        <View style={{flexDirection: 'row'}}>
            <SText fontWeight={700} fontSize={16}>{price}</SText>
            <SText fontWeight={700} fontSize={14} style={{marginTop: 1}}>{' ₽'}</SText>
        </View>
    </View>
}

export default OrderProduct
