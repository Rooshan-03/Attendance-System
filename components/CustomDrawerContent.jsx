import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth  } from '../firebase.config.js';
import { ActivityIndicator } from 'react-native-paper';
import useUserLoggedInState from 'zustand/store';

const CustomDrawerContent = (props) => {
  const [storedUser, setStoredUser] = useState({})
  const [loading, setLoading] = useState(true)
  const navigation = useNavigation();

  const { setUserState, checkUserState } = useUserLoggedInState();

  const handleLogout = async () => {
    Alert.alert('Warning',
      'Are You sure you want to Logout',
      [
        {
          text: 'Cancel',
          style: 'cancel'

        },
        {
          text: 'Ok',
          onPress: async () => {
            await auth.signOut();
            await AsyncStorage.removeItem('user')
            setUserState(false)
            console.log(checkUserState())
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }
        }
      ]
    )

  };
  useEffect(() => {
    const getDetails = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          const user = JSON.parse(stored);
          console.log(user)
          setStoredUser(user)
          setLoading(false)
        }

      } catch (e) {
      }
    };

    getDetails();
  }, []);

  return (
    <View className='flex-1'>
      <DrawerContentScrollView {...props}>
        {loading ? (
          <View className='h-2/5 bg-slate-100 rounded-md mb-3 flex items-center justify-center'>
            <ActivityIndicator size={'small'} color='blue' />
          </View>
        ) : (
          <View className='h-2/5 mb-3'>
            <View className='flex flex-row items-center ml-3'>
              <View className='w-14 h-14 bg-blue-300 flex items-center justify-center rounded-full mx-2'>
                <Ionicons name='person-sharp' size={30} color={"#FFF"} />
              </View>
              <Text className='font-sens font-extrabold text-gray-500 '> {storedUser.name}</Text>
            </View>
            <View className='w-full h-[0.4] bg-slate-500 mt-2'></View>
            <Text className='font-sens font-extrabold text-gray-500 mt-2'>{storedUser.number}</Text>
            <Text className='font-sens font-extrabold text-gray-500 mb-2'>{storedUser.email}</Text>
            <View className='w-full h-[0.4] bg-slate-500 my-2'></View>
          </View>
        )
        }

        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View className='mb-12 p-3'>
        <View className='w-full h-[0.4] bg-slate-500 my-4'></View>

        <TouchableOpacity
          className='w-full h-10 flex rounded-md items-center justify-center bg-red-500 '
          onPress={handleLogout}
        >
          <Text className='text-white font-extrabold'>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


export default CustomDrawerContent;