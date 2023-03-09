/**
 * @format
 */

import {AppRegistry, TextInput, Text} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import YaMap, { Geocoder } from "react-native-yamap";
import { GeocoderKeys, getRandomKey, getRandomMapKey } from "./config";

//YaMap.init(getRandomMapKey())
YaMap.init('329a49e2-df63-442e-b4d1-e74b00614e8a')
Geocoder.init(getRandomKey(GeocoderKeys))

AppRegistry.registerComponent(appName, () => App);

if (Text.defaultProps == null) {
  Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;
}

if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;
}
