import React from "react";
import { Text } from "react-native";
import { text } from "../utils/mixins";
import Colors from "../utils/Colors";

export default ({
                  fontSize,
                  fontWeight,
                  color = Colors.darkBlue,
                  fontType,
                  gap,
                  style,
                  ...props
                }) => {
  return <Text
    allowFontScaling={false}
    style={{
      ...text(fontSize, fontWeight, fontType, gap),
      ...style,
      color: color,
    }}
    {...props}
  >{props.children}</Text>;
}
