import React from 'react'
import { Image } from "react-native";

export default function({iconSrc, size=24, style={}}) {
  return <Image source={iconSrc} style={{width: size, height: size, ...style}} resizeMode={'contain'}/>
}
