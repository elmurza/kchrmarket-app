import React, { useContext, useEffect, useMemo, useState } from "react";
import {useOfflineField, useStateField} from "../utils/hooks";
import {
  appendPromoCode,
  createAddress,
  getBanners,
  getCart,
  getCatalogue,
  getDeliverySlots,
  getProductById,
  getUserInfo,
  makeOrder,
  pushCart, removePromoCode,
  setLocation, updateAddress,
  updateCard, updateFCM,
  updateUserInfo,
} from "../api";
import {DOMAIN_URL} from "../config";
import {categoryColors, idToColor} from "../utils/Colors";
import AsyncStorage from "@react-native-community/async-storage";
import { RegionContext } from "../App";
import {isInMoscow} from "../utils/regionDeterminer";
import {randomPoint} from "../screens/LocationPicker";
import AppMetrica from "react-native-appmetrica";
import { initFCM } from "../utils/Firebase";

const PLACEHOLDER_URL = 'https://seasonmarket.ru/static/media/productImagePlaceholder.d465d3f7.png';

const defaultStateField = {
  data: {},
  load: async () => {},
  get: async () => {},
  update: async () => {},
  remove: async () => {},
};

const defaultOfflineField = {
  data: null,
  get: ()=>{},
  set: (value)=>value
}

const defaultMethod = async () => {};


const cartShape = {
  basketAmount: 0,
  deliveryPrice: 0,
  productList: [],
  promocode: ''
}
const useOfflineLocation = (setRegion=()=>{}) => {
  const [data, setData] = useState({
    address: '',
    comment: '',
    floor: '',
    number: '',
    door: '',
    lat: randomPoint.lat,
    lon: randomPoint.lon,
    point: {lat: randomPoint.lat, lon: randomPoint.lon}
  })


  const [isLoaded, setLoaded] = useState(false)

  useEffect(()=>{
    if (data.address) {
      const newRegion = isInMoscow(data.lat, data.lon) ? 77 : 78
      setRegion(newRegion)
    }
  }, [data.address])

  async function get () {
    const savedData = JSON.parse(await AsyncStorage.getItem('location'))

    if (savedData) {
      setData(savedData)
      setLoaded(true)
    }
  }

  async function load () {
    if (!isLoaded)
      return await get()
  }

  async function update (_data) {
    const newData = {...data, ..._data, point: {lat: _data?.lat, lon: _data?.lon}}
    await AsyncStorage.setItem('location', JSON.stringify(newData))
    setData(newData)
  }

  return {data, get, update, load, remove: ()=>{}}
}

const useOfflineCart = (getProductById) => {
  const [state, setState] = useState()
  const [read, setRead] = useState(false)


  async function pushToLS (list) {
    if (read)
      await AsyncStorage.setItem('localCart', JSON.stringify(list))
  }


  async function getFromLS () {
    const savedCart = JSON.parse(await AsyncStorage.getItem('localCart'))

    setState(prev => ({
      ...prev,
      productList: savedCart
    }))
    setTimeout(()=>{
      processCart()
    }, 200)
  }

  function addProduct (product_id, quantity) {
    AppMetrica.reportEvent('Продукт добавлен в корзину (Н/А)', {[product_id]: quantity})
    setState(prev => {
      const positionIndex = prev.productList?.findIndex(pos => pos.product_id == product_id)
      return {
        ...prev,
        productList: positionIndex && positionIndex === -1 ?
          [...(prev?.productList || []), { product_id, quantity }] :
          prev.productList?.map((item) => item.product_id === product_id ? {product_id, quantity} : item)
      }
    })
    processCart()
  }

  function clearCart () {
    setState(cartShape)
    processCart()
  }


  function processCart () {
    setState(prev=>{
      const productList = prev?.productList?.filter(pos=>pos.quantity > 0)?.map(pos=>({
        ...pos,
        price: pos?.price || getProductById(pos.product_id)?.price || 0
      })) || []
      const totalProductsPrice = productList?.reduce((total, pos)=>pos.price * pos.quantity + total, 0) || 0
      const deliveryPrice = totalProductsPrice >= 4000 ? 0 : 150
      const amount_bonuses = totalProductsPrice >= 10000 ? 1000 :  totalProductsPrice >= 7000 ? 500 : 0

      pushToLS(productList).then(()=>setRead(true))
      return {
        productList,
        basketAmount: totalProductsPrice-amount_bonuses,
        deliveryPrice,
        amount_bonuses,
      }
    })
  }

  useEffect(()=>{
    processCart()
    setTimeout(()=>{
      getFromLS()
    }, 300)
  }, [])

  return {
    data: state,
    get: () => state,
    update: addProduct,
    remove: clearCart,
    _load: ()=>{},
    reset: clearCart,
  }
}

const useLocation = (data) => {
  const {region, setRegion, setMigrating} = useContext(RegionContext)

  const [isAuthorized, setAuthorized] = useState(false)


  useEffect(()=>{
    AsyncStorage
        .getItem('token')
        .then((token)=>setAuthorized(!!token))
  })

  const offlineState = useOfflineLocation(setRegion)
  const onlineState = useStateField({
    getter: async () => {
      const response = await getUserInfo()
      if (!response) return

      const location = response.address?.[(response.address?.length || 1) - 1] || {}

      if (location.address) {
        const newRegion = isInMoscow(location.lat, location.lon) ? 77 : 78
        setRegion(newRegion)
      }
      return {
        ...location,
        point: {
          lat: location?.lat,
          lon: location?.lon,
        },
        address: location?.address,
      }
    },
    updater: async (newData) => {
      const response = await getUserInfo()
      if (!response) return

      let resp

      const location = response.address?.[(response.address?.length || 1) - 1] || {}

      if (location.id)
        resp = await updateAddress({ id: location.id, ...location, ...newData })
      else
        resp = await createAddress({ ...location, ...newData })

      return resp
    },
    deleter: async () => {},
    _private: true,
  })

  async function onAuthorized() {
    setMigrating(true);
    if (offlineState.data.address != "")
      await createAddress(offlineState.data);
    await onlineState.get();
    await AsyncStorage.removeItem("location");
    setMigrating(false);
  }

  useEffect(()=>{
    if (isAuthorized) {
      onAuthorized();
    } else {
      offlineState.remove();
    }
  }, [isAuthorized])

  return isAuthorized ? onlineState : offlineState
}
const useCart = ({getProductById}) => {
  const [isAuthorized, setAuthorized] = useState(false)
  const {region, setMigrating} = useContext(RegionContext)


  useEffect(()=>{
    AsyncStorage
      .getItem('token')
      .then((token)=>setAuthorized(!!token))
  })

  const onlineState = useStateField({
    getter: getCart,
    updater: (productId, quantity)=> {
      AppMetrica.reportEvent('Продукт добавлен в корзину', {[productId]: quantity})
      return updateCard(productId, quantity, region)
    },
    deleter: async () => await pushCart([], region),
    instant: true, _private: true
  })

  const offlineState = useOfflineCart(getProductById)

  async function onAuthorized () {
    setMigrating(true)
    const productsToPush = offlineState?.data?.productList?.map(pos=>({productId: pos.product_id, quantity: pos.quantity}))
    if (productsToPush?.length) {
      await pushCart(productsToPush, region);
      await onlineState.get(region);
      await offlineState.remove();
      await AsyncStorage.removeItem("localCart");
    }
    setMigrating(false)
  }

  useEffect(()=>{
    if (isAuthorized) {
      onAuthorized()
    } else {
      offlineState.remove()
    }
  }, [isAuthorized])

  useEffect(()=>{
    if (isAuthorized) {
      onlineState.get(region)
    }
  }, [region])

  return isAuthorized ? onlineState : offlineState
}

const shape = {
  auth: defaultStateField,
  userLocation: defaultStateField,
  catalogue: defaultStateField,
  cart: defaultStateField,
  user: defaultStateField,
  deliverySlots: defaultStateField,
  paymentMethod: defaultStateField,
  authorize: defaultMethod,
  signOut: defaultMethod,
  setLocation: defaultMethod,
  loadCatalogue: defaultMethod,
  getProduct: defaultMethod,
  offlineCart: defaultOfflineField,
  makeOrder: ({paymentType = 1, scores, deliverySlot = {}})=>{},
  getProductById: defaultMethod,
};

const DataContext = React.createContext(shape);

export function useAppData(isApp = true) {

  const {region, setRegion} = useContext(RegionContext)

  const data = {
    auth: useStateField({
      getter: async () => {
        return isApp ?
          await AsyncStorage.getItem("token") :
          localStorage.getItem("token");
      },
      updater: async (token) => {
        return isApp ?
          await AsyncStorage.setItem("token", token) :
          localStorage.setItem("token", token);
      },
      deleter: async () => {
        return isApp ?
          await AsyncStorage.removeItem("token") :
          localStorage.removeItem("token");
      },
    }),
    userLocation: useLocation(this),
    catalogue: useStateField({
      getter: async () => mapCatsV2(await getCatalogue(region))
    }),
    cart: useCart({
      isAuthorized: this?.auth?.data != null,
      getProductById: (id)=>methods?.getProductSync(id)

    }),
    user: useStateField({
      getter: async ()=> {
        const response = await getUserInfo();
        if (response)
          initFCM()
        return response
      },
      updater: updateUserInfo,
      _private: true,
    }),
    banners: useStateField({
      getter: getBanners,
    }),
    deliverySlots: useStateField({
      getter: async () => await getDeliverySlots(region)
    }),
    offlineCart: useOfflineField(),
    paymentMethod: useStateField({
      getter: async () => {
        const saved = JSON.parse(await AsyncStorage.getItem('defaultPayment'))
        return saved
      },
      updater: async (item) => {
        return await AsyncStorage.setItem('defaultPayment', JSON.stringify(item))
      }
    })
  };

  const methods = {
    authorize: async (token) => {
      return await data.auth.update(token);
    },
    getProductById: async (id) =>  {
      const product = data.catalogue.data?.products?.find(product => product.id == id)
      if (product)
        return product
      else {
        return await methods.getProduct(id)
      }
    },
    getProductByEcoId: (id) =>  {
      const product = data.catalogue.data?.products?.find(product => product.eco_id == id)
      if (product)
        return product
      else {
        return null
      }
    },
    signOut: async () => {
      data.cart.reset()
      data.user.reset()
      await data.auth.remove();
      await data.userLocation.remove();
    },
    setLocation: async (address, point) => {
      await data.userLocation.update(point, address);
    },
    loadDeliverySlots: async () => {
      return await data.deliverySlots.get(region)
    },
    getProduct: async (id) => {
      const response = await getProductById(region, id) || [null];

      const product = response?.product
      const recommended = response?.recommended
      return {
        ...product,
        price: Number(product?.price),
        old_price: Number(product?.old_price),
        medium_image: product?.medium_image || product?.small_image ?
            DOMAIN_URL+(product?.medium_image || product?.small_image) :
            PLACEHOLDER_URL,
        small_image: product?.medium_image || product?.small_image ?
            DOMAIN_URL+(product?.small_image || product?.medium_image) :
            PLACEHOLDER_URL,
        big_image: product?.medium_image || product?.small_image ?
            DOMAIN_URL+(product?.big_image || product?.medium_image) :
            PLACEHOLDER_URL,
        weight: Number(product?.weight),
        recommended,
      }
    },
    getProductSync: (id) => {
      return data.catalogue.data?.products?.find(product => product.id == id)
    },
    getIsAuth: () => {
      return !!data.auth.data
    },
    makeOrder: async ({...args}) => {
      const response =  await makeOrder({region,  address_id: data.userLocation.data.id, ...args})
      if (response) {
        await data.user.get()
      }
      return response
    },
    appendPromoCode: async (code) => {
      const response =  await appendPromoCode(region, code)
      await data.cart?.get(region)
      return response
    },
    removePromoCode: async () => {
      const response =  await removePromoCode(region)
      await data.cart?.get(region)
      return response
    }
  };

  useEffect(()=>{
    data.catalogue.get(region)
    data.deliverySlots.get(region)
    data.cart.get(region);
  }, [region])

  useEffect(()=>{
    data.deliverySlots.get(region)
  }, [data.userLocation.data?.address])

  useEffect(() => {
    if (data.auth.data) {
      data.userLocation.get();
      data.cart.get(region);
      data.user.get();
      data.deliverySlots.get(region)
    }
  }, [data.auth.data]);

  async function fetchAll() {
    let promises = [];
    const isAuthorized = !!data.auth.data
    for (const field in data) {
      if (data[field]?.load && (isAuthorized || !data[field]?._private))
        promises.push(new Promise(resolve => {
          data[field].load().then(resolve);
        }));
    }
    return await Promise.all(promises);
  }



  return { ...data, ...methods, fetchAll };
}

export default DataContext;

const IS_WEB = false //

export function mapCatsV2 (response) { //todo map for app
  //console.log('#########',JSON.stringify(response, false, ' '));
  if (!response?.data?.categories) return

  const products = response.data.products.map(product=>({
    ...product,
    price: Number(product?.price),
    old_price: Number(product?.old_price),
    medium_image: (product?.medium_image || product?.small_image) ?
        DOMAIN_URL + (product?.medium_image || product?.small_image) :
        PLACEHOLDER_URL,
    small_image: (product?.medium_image || product?.small_image) ?
        DOMAIN_URL + (product?.small_image || product?.medium_image) :
        PLACEHOLDER_URL,
    big_image: (product?.medium_image || product?.small_image) ?
        DOMAIN_URL + (product?.big_image || product?.medium_image) :
        PLACEHOLDER_URL,
    weight: Number(product?.weight),
    slave_category: JSON.parse(product?.slave_category),
    master_category: JSON.parse(product?.master_category),
  })).filter(product=>product?.availableones && product?.availableones > 0)


  const categories = response.data.categories
    .filter(category=>category?.active == '1')
    .map(category=>({
      ...category,
      firstSubCategoryId: category.subCategories?.[0]?.category_id || null, // todo
      firstSubCategoryUrl: category.subCategories?.[0]?.url || null, // todo
      subCategories: (category.subCategories.filter(subCategory=>subCategory?.active == '1').length && !IS_WEB ?
        category.subCategories
          .filter(subCategory=>subCategory?.active == '1').map(subCategory=>({
          ...subCategory,
          parentId: category.id,
          data: products.filter(product=>product?.slave_category?.includes(Number(subCategory.id))),
          color: idToColor(subCategory.id, categoryColors)
        })) :
        [{
          data: products.filter(product=>product?.master_category?.includes(Number(category.id))),
          color: idToColor(category.id, categoryColors),
          parentId: category.id,
          id: category.id+'all',
          name: category.name,
        }])?.filter(sc=>sc.data?.length > 0),
    }))
    ?.filter(c=>c.subCategories?.length > 0)
    .map(cat=>({...cat, firstSubCat: cat.subCategories?.[0]?.id || cat.id}));

  // for SectionList in the mobile app
  const allSubCategories = IS_WEB ?
    [] :
    categories
      .reduce((subCategories, category) => {
        return [
          ...subCategories,
          ...category.subCategories.map((subCategory, index, array)=>({
            ...subCategory,
            isFirst: index === 0,
            isOnly: array.length < 2,
            parentName: category.name
          }))
        ]
      }, [])
      .map((subCategory, index)=>(
        {
          ...subCategory,
          index
        }
      )); // index for scrolling

  // app helper ))F
  const indexes = IS_WEB ?
    null :
    [...allSubCategories].reduce((map, current, index) => {
      return {
        ...map,
        [current.id]: index,
      };
    }, {})


  return {
    categories,
    allSubCategories,
    indexes,
    products,
    threshold: response.region?.min_amount_order_pc || 3000
  }
}

/*
███████▓█████▓▓╬╬╬╬╬╬╬╬▓███▓╬╬╬╬╬╬╬▓╬╬▓█
████▓▓▓▓╬╬▓█████╬╬╬╬╬╬███▓╬╬╬╬╬╬╬╬╬╬╬╬╬█
███▓▓▓▓╬╬╬╬╬╬▓██╬╬╬╬╬╬▓▓╬╬╬╬╬╬╬╬╬╬╬╬╬╬▓█
████▓▓▓╬╬╬╬╬╬╬▓█▓╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬▓█
███▓█▓███████▓▓███▓╬╬╬╬╬╬▓███████▓╬╬╬╬▓█
████████████████▓█▓╬╬╬╬╬▓▓▓▓▓▓▓▓╬╬╬╬╬╬╬█
███▓▓▓▓▓▓▓╬╬▓▓▓▓▓█▓╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬▓█
████▓▓▓╬╬╬╬▓▓▓▓▓▓█▓╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬▓█
███▓█▓▓▓▓▓▓▓▓▓▓▓▓▓▓╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬▓█
█████▓▓▓▓▓▓▓▓█▓▓▓█▓╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬▓█
█████▓▓▓▓▓▓▓██▓▓▓█▓╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬██
█████▓▓▓▓▓████▓▓▓█▓╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬██
████▓█▓▓▓▓██▓▓▓▓██╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬██
████▓▓███▓▓▓▓▓▓▓██▓╬╬╬╬╬╬╬╬╬╬╬╬█▓╬▓╬╬▓██
█████▓███▓▓▓▓▓▓▓▓████▓▓╬╬╬╬╬╬╬█▓╬╬╬╬╬▓██
█████▓▓█▓███▓▓▓████╬▓█▓▓╬╬╬▓▓█▓╬╬╬╬╬╬███
██████▓██▓███████▓╬╬╬▓▓╬▓▓██▓╬╬╬╬╬╬╬▓███
███████▓██▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╬╬╬╬╬╬╬╬╬╬╬████
███████▓▓██▓▓▓▓▓╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬▓████
████████▓▓▓█████▓▓╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬╬▓█████
█████████▓▓▓█▓▓▓▓▓███▓╬╬╬╬╬╬╬╬╬╬╬▓██████
██████████▓▓▓█▓▓▓╬▓██╬╬╬╬╬╬╬╬╬╬╬▓███████
███████████▓▓█▓▓▓▓███▓╬╬╬╬╬╬╬╬╬▓████████
██████████████▓▓▓███▓▓╬╬╬╬╬╬╬╬██████████
███████████████▓▓▓██▓▓╬╬╬╬╬╬▓███████████
*/

