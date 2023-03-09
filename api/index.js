import axios from 'axios'
import {BASE_URL, GeocoderKeys} from "../config";
import { Suggest } from "react-native-yamap";
import AsyncStorage from "@react-native-community/async-storage";
import * as AxiosLogger from 'axios-logger'


const api = axios.create({
  baseURL: BASE_URL
})

api.interceptors.request.use(AxiosLogger.requestLogger)

api.interceptors.response.use(
  (response) => AxiosLogger.responseLogger(response, { method: true, data: false, headers: false }),
  (error) => AxiosLogger.errorLogger(error, { method: true, data: false, headers: false })
)


async function createHeaders() {
  const token = await AsyncStorage.getItem('token')

  if (!token) return false
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
}

function data(response) {
  if (response?.data?.data) {
    return response?.data?.data;
  } else
    return console.log({response: response?.data?.message}) || false
}

export async function requestConfirmationCode(phone = '', isAgreed = true, device = 'web') {
  return await api.post(`auth`, {
    phone: phone,//.replace('+7', '8').replace(/[(|)|\-| ]/g, ''),
    adv_messages: isAgreed,
    device
  }).catch(console.error).then(data)
}

export async function submitAuthCode(code, token) {
  return await api.post('auth/check-code', {code, token}).catch(console.error).then(data)
}

export async function getCatalogue(region) {
  try {
    return await api.get(`store/${region}/catalog`).catch(console.error).then(data);
  } catch (e) {
    console.warn(e);
  }
}

export async function getAddressSuggestions (address='', myCoords) {
  if (address === '') return []
  //const response = await axios.get(`https://geocode-maps.yandex.ru/1.x/?apikey=${GeocoderKeys[0]}&geocode=${address}&format=json&kind=house&bbox=${addressSearchBounds}`).then(r=>r.data)
  const suggestions = await Suggest.suggestWithCoords(address)
  return (suggestions || []).map(item=>({
    name: extractCity(item.subtitle)+', '+item.title,
    point: {
      lat: item.lat,
      lon: item.lon
    }
  }))
}

export async function getCart(region) {

  const headers = await createHeaders()
  if (!headers) return null
  try {
    return await api.post('basket',{region}, headers).catch(console.error).then(data)
  } catch (e) {
    //return await api.get('basket', headers).catch(console.error).then(data)
  }

}

export async function updateCard(productId, quantity, region) {
  const headers = await createHeaders()

  return await api.post('basket/update', {products: {productId: Number(productId), quantity}, region}, headers).catch(console.error).then(data)
}

export async function pushCart(products = [], region) {
  const headers = await createHeaders()

  return await api.post('basket/insert', {products, region}, headers).catch(console.error).then(data)
}

export async function getProductById(region, productId) {

  const url = `store/${region}/product/${productId}`
  return api.get(url).catch(console.error).then(data)
}

export async function validateLocation(lat, lon) {
  return await api.post(`user/validateLocation`, {lat, lon}).catch(console.error).then(data)
}

export async function setLocation(point, address) {
  const headers = await createHeaders()
  if (!headers) return null
  return await api.post('user/setLocation', {lat: point.lat, lon: point.lon, address}, headers).catch(console.error).then(data)
}

export async function getUserInfo() {
  const headers = await createHeaders()
  if (!headers) return null
  return await api.get('user', headers).catch(console.error).then(data)
}

export async function deleteUser() {
  const headers = await createHeaders()
  if (!headers) return null
  return await api.post('user/block',{}, headers).catch(console.error).then(data)
}

export async function updateUserInfo(data) {
  const headers = await createHeaders()
  if (!headers) return null
  return await api.post('user/update', data, headers).catch(console.error).then(data)
}

export async function getBanners() {
  return await api.get('banners/get').catch(console.error).then(data)
}

export async function makeOrder ({region, paymentType = 1, scores = 0, address_id, deliverySlot = {}}) {
  const headers = await createHeaders()
  if (!headers) return null

  return await api.post('order/create',
    {
      type_payment: paymentType,
      deliverySlot,
      scores,
      region,
      source: 1, // 1-app, 0-web
      address_id,
    },
    headers).catch(console.error).then(data)
}

/*export async function getGeoSuggestions (string) {
  const url = `https://geocode-maps.yandex.ru/1.x?geocode=${string}&apikey=${GeocoderKeys[0]}&kind=house&rspn=1&bbox=20.742187,26.431228~188.789062,78.903929&format=json`
  const response = await axios.get(url).then(r=>r.data?.response)

  const suggestions = response?.GeoObjectCollection?.featureMember.map(el => {
    const name = el.GeoObject?.metaDataProperty?.GeocoderMetaData?.Address?.formatted
    const point = el.GeoObject?.Point?.pos.split(' ')
    return {
      name: name?.replace('Россия, ', ''),
      point: {
        lat: point[1],
        lon: point[0]
      }
    }
  })
  return suggestions
}*/

export async function getDeliverySlots(region) {
  const headers = await createHeaders()

  return api.get(`store/${region}/slots`).catch(console.error).then(data)
}

export async function getOrder (id) {
  const headers = await createHeaders()
  if (!headers) return null
  return api.get('user/order/'+id, headers).catch(console.error).then(data)
}

export async function searchHints(string, userId='GUEST') {
  return []// axios.get(`https://search.ecomarket.ru/?id=11608&query=${string}&uid=cc441f080&categories=0&limit=18&location=77`).then(r => r.data)
}

export async function searchAll(string, userId='GUEST'){
  return axios.get(`https://search.ecomarket.ru/?id=11608&query=${string}&uid=cc441f080&categories=0&limit=18&location=77`).then(r => r.data)
}

export async function clearSearchHistory(userId='GUEST') {
  return axios.delete(`https://search.ecomarket.ru/history?id=11608&uid=SM_${userId}`).then(r=>r.data)
}

export async function createAddress(payload = {
  address: '',
  number: '',
  door: '',
  floor: '',
  comment: '',
  lat: '',
  lon: ''
}) {
  const headers = await createHeaders()
  if (!headers) return null
  return api.post('user/createAddress', payload, headers).catch(console.error).then(data)
}

export async function appendPromoCode (region, code) {
  const headers = await createHeaders()
  if (!headers) return null
  return api.post('basket/promocode', {region, promocode: code}, headers).catch(console.error).then(data)
}

export async function removePromoCode (region) {
  const headers = await createHeaders()

  if (!headers) return null
  return api.post('basket/promocode/delete', {region}, headers).catch(console.error).then(data)
}

export async function updateFCM (token) {
  const headers = await createHeaders()

  if (!headers) return null
  return api.post('user/update-fcm-token', {fcmToken: token}, headers).then(data)
}

export async function updateAddress(payload = {
  id: 0,
  address: '',
  number: '',
  door: '',
  floor: '',
  comment: '',
  lat: '',
  lon: ''
}) {
  const headers = await createHeaders()
  if (!headers) return null
  return api.post('user/updateAddress', payload, headers).catch(console.error).then(data)
}

export async function getOrderToPayInfo (orderId) {
  return await api.post('payment/order/pay', {order_id: orderId}).catch(console.error).then(data)
}

function extractCity(subtitle) {
  const array = subtitle.split(',').map(w => w.trim())

  return array.filter((_, i, a) => i !== a.length - 1).join(', ') || subtitle
}
