import React, {createContext, useContext, useEffect, useState} from "react";
import {useCoolDown} from "../utils/hooks";
import {clearSearchHistory, searchAll, searchHints} from "../api";
import DataContext from "./DataContext";

const shape = {
    query: '',
    popupVisible: false,
    suggestions: {
        products: [],
        categories: [],
        history: [],
        autocomplete: []
    },
    results: {
        products: [],
        categories: [],
        alternatives: [],
        query: ''
    },
    show: ()=>{},
    hide: ()=>{},
    clearHistory: ()=>{},
    search: async () => {},
    peek: async () => {},
    onQueryChange: async (value) => {},
}

export const SearchContext = createContext(shape)

export const useContextSearch = () => {

    const {user} = useContext(DataContext)

    const [state, setState] = useState({
        query: '',
        popupVisible: false,
        suggestions: {
            products: [],
            categories: [],
            history: [],
            autocomplete: []
        },
        results: {
            products: [],
            categories: [],
            alternatives: [],
            query: ''
        }
    })

    async function search () {
        // set products and cats
    }

    async function mapIdsToProducts (ids=[]) {

    }

    async function peek (string) {
        if (string == '')
            return clear()

        const autocomplete = await searchHints(string, user?.id)
        const all = await searchAll(string)
        const resultsSuggestions = autocomplete?.results
        const resultAll = all.results
        setState(prev=>({
            ...prev,
            suggestions: {
                products: resultAll?.ids?.map(item=> ({id: item,})) || [],
                categories: resultAll?.categories,
                autocomplete: [
                    autocomplete?.corrected?.highlight,
                    ...(resultsSuggestions?.suggest || [])]?.filter(v=>!!v).map(value => value.replace(/\<b\>|\<\/b\>/gm, '')),
             //   history: history?.history
            }
        }))

    }

    async function clearHistory () {
        await clearSearchHistory(user?.id)
        peek(state.query)

    }

    function clear () {
        setState(prev=>({
            query: '',
            popupVisible: prev.popupVisible,
            suggestions: {
                products: [],
                categories: [],
                autocomplete: []
            },
            results: {
                products: [],
                categories: [],
                alternatives: [],
                query: ''
            }
        }))
    }


    const setSuggestions = useCoolDown(peek, 200)

    useEffect(()=>{
        setSuggestions(state.query)
    }, [state.query])

    function onQueryChange (value) {
        setState(prev=>({
            ...prev,
            query: value
        }))
    }

    return {
        ...state,
        onQueryChange,
        clearHistory,
        search,
        show: ()=>setState(prev=>({...prev, popupVisible: true})),
        hide: ()=>setState(prev=>({...prev, popupVisible: false})),
    }
}

const useSearch = () => {
    return useContext(SearchContext)
}


export default useSearch
