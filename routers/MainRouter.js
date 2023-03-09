import React, {useContext, useEffect} from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignIn from "../screens/SignIn";
import DataContext from "../data/DataContext";
import LocationPicker from "../screens/LocationPicker";
import Catalogue from "../screens/Catalogue";
import ProductModal from "../screens/ProductModal";
import CartModal from "../screens/CartModal";
import UserModal from "../screens/UserModal";
import OrderHistory from "../screens/OrderHistory";
import OrderDetails from "../screens/OrderDetails";
import Search from "../screens/Search";
import {useNavigation} from "@react-navigation/native";
import GenericWebView from "../screens/GenericWebView";

const MainStack = createNativeStackNavigator();


const MainRouter = () => {
  const { auth } = useContext(DataContext);
  const {navigate} = useNavigation()
  const isAuthorized = auth.data != null;

  useEffect(()=>{
    if (!isAuthorized)
      setTimeout(()=>{
        navigate('SignIn')
      },400)
  }, [])

  return <MainStack.Navigator screenOptions={{ headerShown: false }}>
    {<>
      <MainStack.Group>
        <MainStack.Screen name={"Catalogue"} component={Catalogue}/>
        <MainStack.Screen name={"Map"} component={LocationPicker}
                          options={{presentation: 'fullScreenModal', gestureEnabled: false,}}/>
      </MainStack.Group>
      <MainStack.Group
          screenOptions={{
            presentation: 'modal',
            headerMode: 'none',
            gestureEnabled: true,
            gestureResponseDistance: {vertical: 500},
          }}>
        {isAuthorized ? null : <MainStack.Screen name={"SignIn"} component={SignIn}/>}
        <MainStack.Screen name={"ProductModal"} component={ProductModal}/>
        <MainStack.Screen name={"CartModal"} component={CartModal}/>
        <MainStack.Screen name={"UserModal"} component={UserModal}/>
        <MainStack.Screen name={"OrderHistory"} component={OrderHistory}/>
        <MainStack.Screen name={"OrderDetails"} component={OrderDetails}/>
        <MainStack.Screen name={"Search"} component={Search}/>
        <MainStack.Screen name={"WebView"} component={GenericWebView} options={{presentation: 'card'}}/>
      </MainStack.Group>
    </>
    }
  </MainStack.Navigator>;
};

export default MainRouter;
