import { Dimensions } from "react-native";

export const BASE_URL = 'https://api.seasonmarket.ru/api/'
export const DOMAIN_URL = 'https://api.seasonmarket.ru/'

export const MapKitKeys = [
  '95f79f13-83ec-42b6-890b-db1b8b823e92',
  '329a49e2-df63-442e-b4d1-e74b00614e8a',
]

export const GeocoderKeys = [
  '24495f21-70af-4b3c-ac1b-8a23d30ae9ab',
  '486bc32f-60f4-4320-9d61-c8d14935e017',
  'c0e4e3d2-913b-4873-a81a-59ea899446f8',
  '64f61949-4219-4c76-9c63-a76af46cb444',
  'a45fc414-5133-407b-a440-91d028095f30',
  'ddb478df-6120-46a8-8331-ea67cefec68c'
]

export function getRandomKey (keys) {

  const index = Math.floor(Math.random() * keys.length)

  return keys[index]
}

export const APPMETRICA_APIKEY = '6a10df14-85e7-4bc0-a55b-d54cc06171ee'


export function getRandomMapKey () {
  return MapKitKeys[1]

  const index = Math.round(Math.random())*(MapKitKeys.length - 1)
  return MapKitKeys[index]
}

export const modalHeight = Dimensions.get("window").height - 100

export const addressSearchBounds = '29.327057,60.243699~39.589145,54.931679'

export const screenDims = { ...Dimensions.get("window") }

export const cardImageSize = Math.floor((screenDims.width - 40) / 2) - 5

export const SupportPhoneNumber = '+7 495 215-51-44'

export const SupportWANumber = '+7 966 036-34-33'


export const inputFormat = 'YYYY-MM-DD HH:mm:SS'
export const targetFormat = 'HH:mm'
export const dayFormat = 'LL'


// CATALOGUE LAYOUT DIMENSIONS

export const CATEGORY_FONTSIZE = 36;
export const SUBCATEGORY_FONTSIZE = 24;
export const CATEGORY_TITLE = CATEGORY_FONTSIZE + 8;
export const SUBCATEGORY_TITLE = SUBCATEGORY_FONTSIZE + 8;
export const SUBCATEGORY_CAROUSEL = 68;
export const CATEGORY_CAROUSEL = 90;
export const CARD_HEIGHT = 320;
export const DELIVERY_BLOCK_HEIGHT = 146

export const bannerWidth = screenDims.width - 70
export const bannerHeight = Math.floor(bannerWidth / 61 * 31)



/*
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⠛⢩⣴⣶⣶⣶⣌⠙⠫⠛⢋⣭⣤⣤⣤⣤⡙⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡟⢡⣾⣿⠿⣛⣛⣛⣛⣛⡳⠆⢻⣿⣿⣿⠿⠿⠷⡌⠻⣿⣿⣿⣿
⣿⣿⣿⣿⠏⣰⣿⣿⣴⣿⣿⣿⡿⠟⠛⠛⠒⠄⢶⣶⣶⣾⡿⠶⠒⠲⠌⢻⣿⣿
⣿⣿⠏⣡⢨⣝⡻⠿⣿⢛⣩⡵⠞⡫⠭⠭⣭⠭⠤⠈⠭⠒⣒⠩⠭⠭⣍⠒⠈⠛
⡿⢁⣾⣿⣸⣿⣿⣷⣬⡉⠁⠄⠁⠄⠄⠄⠄⠄⠄⠄⣶⠄⠄⠄⠄⠄⠄⠄⠄⢀
⢡⣾⣿⣿⣿⣿⣿⣿⣿⣧⡀⠄⠄⠄⠄⠄⠄⠄⢀⣠⣿⣦⣤⣀⣀⣀⣀⠄⣤⣾
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⡶⢇⣰⣿⣿⣟⠿⠿⠿⠿⠟⠁⣾⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡟⢛⡛⠿⠿⣿⣧⣶⣶⣿⣿⣿⣿⣿⣷⣼⣿⣿⣿⣧⠸⣿⣿
⠘⢿⣿⣿⣿⣿⣿⡇⢿⡿⠿⠦⣤⣈⣙⡛⠿⠿⠿⣿⣿⣿⣿⠿⠿⠟⠛⡀⢻⣿
⠄⠄⠉⠻⢿⣿⣿⣷⣬⣙⠳⠶⢶⣤⣍⣙⡛⠓⠒⠶⠶⠶⠶⠖⢒⣛⣛⠁⣾⣿
⠄⠄⠄⠄⠄⠈⠛⠛⠿⠿⣿⣷⣤⣤⣈⣉⣛⣛⣛⡛⠛⠛⠿⠿⠿⠟⢋⣼⣿⣿
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠉⠉⣻⣿⣿⣿⣿⡿⠿⠛⠃⠄⠙⠛⠿⢿⣿
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢬⣭⣭⡶⠖⣢⣦⣀⠄⠄⠄⠄⢀⣤⣾⣿
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢰⣶⣶⣶⣾⣿⣿⣿⣿⣷⡄⠄⢠⣾⣿⣿⣿
*/
