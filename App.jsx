import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from 'components/Login';
import Signup from 'components/Signup';
import './global.css';
import Home from 'components/Home';
import SplashScreen from 'components/SplashScreen';
import ClassData from 'components/ClassData';
import StudentsData from 'components/StudentsData';
import MarkAttendance from 'components/MarkAttendance';
import ShowAttendance from 'components/ShowAttendance';
import { PaperProvider } from 'react-native-paper';

const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SplashScreen">
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ title: 'Login', headerShown: false }}
          />
          <Stack.Screen
            name="SplashScreen"
            component={SplashScreen}
            options={{ title: 'SplashScreen', headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={Signup}
            options={{ title: 'Signup', headerShown: false }}
          />
          <Stack.Screen
            name='Home'
            component={Home}
            options={{ headerBackVisible: false }}
          />
          <Stack.Screen
            name='ClassData'
            component={ClassData}
            options={{ headerBackVisible: false }}
          />
          <Stack.Screen
            name='StudentsData'
            component={StudentsData}
            options={{ headerBackVisible: false }}
          />
          <Stack.Screen
            name='MarkAttendance'
            component={MarkAttendance}
            options={{ title: 'Mark Attendance', headerBackVisible: false }}
          />
          <Stack.Screen
            name='ShowAttendance'
            component={ShowAttendance}
            options={{ headerBackVisible: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}



//git add .
// git commit -m "Updated login screen"
// git push
