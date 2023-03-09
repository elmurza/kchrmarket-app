import Colors from "./Colors";
import { Platform } from "react-native";

function getFontByThickness (thickness) {
  switch (thickness) {
    case 0: return 'HelveticaNeueCyr-Roman'
    case 1: return 'HelveticaNeueCyr-Medium'
    case 2: return 'HelveticaNeueCyr-Bold'
    case 3: return 'HelveticaNeueCyr-Black'
    default: return 'HelveticaNeueCyr-Medium'
  }
}

export function text (fontSize = 14, fontWeight = 400, fontType = 1, largerGap=false) {

  let type = 0
  if (fontWeight >= 500) {
    type = 1
    if (fontWeight >= 700)
      type = 2
    if (fontWeight >= 900)
      type = 3
  }

  return {
    fontFamily: getFontByThickness(type),
    fontSize,
    fontWeight: fontWeight.toString(),
    color: Colors.darkBlue,
    lineHeight: largerGap ? fontSize*1.2 : fontSize
  }
}

export function circle (size = 26, color = '#f5f5f5', grow=false) {
  return {
    width: grow ? undefined :size,
    minWidth: grow ? size : undefined,
    height: size,
    borderRadius: size / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color
  }
}
