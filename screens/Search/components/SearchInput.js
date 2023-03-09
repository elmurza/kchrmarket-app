import React, {useState} from 'react'
import {TextInput, TouchableOpacity, View} from "react-native";
import Icon from "../../../components/Icon";
import {text} from "../../../utils/mixins";

const SearchInput = ({value='', onValueChange=()=>{}}) => {

    const isEmpty = value === ''

    function clear () {
        onValueChange('')
    }


    return <View style={styles.wrapper}>
        <TextInput placeholder={'Я ищу'}
                   value={value}
                   onChangeText={onValueChange}
                   placeholderTextColor={'#bdbdbd'}
                   style={styles.input}
        />
        {isEmpty ? null :<TouchableOpacity style={{padding: 16}} onPress={clear}>
            <Icon iconSrc={require('../../../assets/images/clear.png')} size={14}/>
        </TouchableOpacity>}
        <TouchableOpacity>
            <Icon iconSrc={isEmpty ? require('../../../assets/images/lensGray.png') : require('../../../assets/images/lensBlack.png')} size={20} style={{marginRight: 12}}/>
        </TouchableOpacity>
    </View>
}

export default SearchInput

const styles = {
    wrapper: {
        backgroundColor: '#f9f9f9',
        flexDirection: 'row',
        borderRadius: 8,
        alignItems: 'center',
        height: 56,
    },
    input: {
        height: '100%',
        flex: 1,
        paddingHorizontal: 12,
        ...text(18, 400)
    }
}
