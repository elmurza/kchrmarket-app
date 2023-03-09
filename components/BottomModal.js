import React from "react";
import Modal from 'react-native-modalbox'
import {StyleSheet, View} from "react-native";
import ModalHeader from "./ModalHeader";


const BottomModal = ({isOpen = false, onClose=()=>{}, title = '', customStyle={}, height=300, ...props}) => {

  const styles = _styles(height)

  return <Modal isOpen={isOpen}
                onClosed={onClose}
                coverScreen={true}
                swipeToClose={true}
                backdropColor={'#000'}
                backdropPressToClose={true}
                backButtonClose={true}
                swipeThreshold={10}
                style={styles.modal}
                position={'bottom'}
  >
    <ModalHeader onClose={onClose}/>
    <View style={{...styles.modalContent, ...customStyle}}>
      {props.children}
    </View>
  </Modal>
}

export default BottomModal

const _styles = (height) => StyleSheet.create({
  modal: {
    height: height,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.39,
    shadowRadius: 8.30,
    elevation: 10,
    zIndex: 9
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  closeButton: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 15,
  },
  modalContent: {
    paddingHorizontal: 20,
    flex: 1,
    paddingBottom: 32,
  }
})
