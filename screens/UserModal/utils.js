import ActionSheet from "react-native-action-sheet";
import { Linking, Platform } from "react-native";
import { SupportPhoneNumber, SupportWANumber } from "../../config";

export function onContactSupport() {
  const options = [
    "Позвонить",
    "Whats App",
    "Отмена",
  ];

  const cancelIndex = options.length - 1;

  ActionSheet.showActionSheetWithOptions({
      options,
      userInterfaceStyle: 'light',
      cancelButtonIndex: cancelIndex,
      destructiveButtonIndex: cancelIndex,
    },
    (buttonIndex) => {
      switch (buttonIndex) {
        case 0:
          launchCall(SupportPhoneNumber)
          break;
        case 1:
          launchWhatsApp(SupportWANumber)
          break;
      }
    },
  );
}

export function launchWhatsApp (phone) {
  Linking.openURL('http://api.whatsapp.com/send?phone='+phone)
}

export function launchCall (phone) {
  const isIos = Platform.OS === 'ios'
  Linking.openURL(isIos ? `telprompt:${phone}` : `tel:${phone}`)
}
