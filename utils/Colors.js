export default {
  darkBlue: "#213140",
  mainGreen: "#2DCC70",
  mainGreenDimmed: "#ABEBC6",
  red: "#FF5252",
  orange: "#FFA353",
  grayBackground: "#EDEDED",
  grayShape: "#C7C7C7",
  grayFont: "#909090",
  white: '#fff'
}

export const categoryColors = [
  '#F3647E', "#2DCC70",
  '#FFA353'
]

export function idToColor (id, colorsArray) {
  return colorsArray[Number(id) % colorsArray.length]
}
