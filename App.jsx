import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { PaperProvider } from 'react-native-paper';
import Login from 'components/Login';
import Signup from 'components/Signup';
import './global.css';
import Home from 'components/Home';
import SplashScreen from 'components/SplashScreen';
import ClassData from 'components/ClassData';
import StudentsData from 'components/StudentsData';
import MarkAttendance from 'components/MarkAttendance';
import ShowAttendance from 'components/ShowAttendance';
import ProfileScreen from 'components/ProfileScreen'; 
import SettingsScreen from 'components/SettingsScreen'; 
import CustomDrawerContent from 'components/CustomDrawerContent';

const Drawer = createDrawerNavigator();

function HomeDrawerNavigator() {
  return (
    <Drawer.Navigator 
      initialRouteName="Home"
      // Use the custom component for the drawer content
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {/* Screens that will appear in the Drawer Menu */}
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{ title: 'Home' }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Drawer.Navigator>
  );
}


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
          
          {/* 
            The 'HomeDrawer' screen is the entry point to the main application flow.
            It is a Stack Screen that holds the Drawer Navigator.
          */}
          <Stack.Screen
            name='HomeDrawer' 
            component={HomeDrawerNavigator}
            options={{ headerShown: false }} 
          />

          {/* 
            All other main application screens are kept in the Stack Navigator, 
            as they should not have the side drawer.
          */}
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
