import ReactNativeHapticFeedback from "react-native-haptic-feedback";

export const round = (value) => (Math.round(value*100)/100).toFixed(value % 1 === 0 ? 0 : 2 )

export function numberWithSpaces(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function between (min, value, max) {
  return Math.min(max, Math.max(value, min))
}


export function declOfNum(n, text_forms) {
  n = Math.abs(n) % 100;
  let n1 = n % 10;
  if (n > 10 && n < 20) { return text_forms[2]; }
  if (n1 > 1 && n1 < 5) { return text_forms[1]; }
  if (n1 == 1) { return text_forms[0]; }
  return text_forms[2];
}

export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


export const handleEnter = (cb) => (e) => {
  if (e.charCode === 13) {
    e.preventDefault()
    cb()
  }
}

export  function removeYear(string) {
  return string.replace(/ [0-9]{4} г\./gm, '')
}

export function insertBetween(array, element){
  return [...array].map((e, i) => i < array.length - 1 ? [e, element] : [e]).reduce((a, b) => a.concat(b))
}

export function vibrate (type='impactMedium') {
  const options = {
    enableVibrateFallback: false,
    ignoreAndroidSystemSettings: false
  };

  ReactNativeHapticFeedback.trigger(type, options);
}
