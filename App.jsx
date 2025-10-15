import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from 'components/Login';
import Signup from 'components/Signup';
import './global.css';
import Home from 'components/Home';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ title: 'Login',headerShown:false }} 
        />
        <Stack.Screen 
          name="Signup" 
          component={Signup} 
          options={{ title: 'Signup' ,headerShown:false }} 
        />
        <Stack.Screen 
        name = 'Home'
        component={Home}
        options={{title:'Home Screen',headerBackVisible:false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
