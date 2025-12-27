import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TextInput } from 'react-native-gesture-handler'
import { getDatabase, ref, update } from 'firebase/database'
import { auth } from '../firebase.config.js';
import { ActivityIndicator } from 'react-native-paper'

const ProfileScreen = () => {
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [number, setNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [userDetail, setUserDetail] = useState([])
  const updateProfileData = () => {
    if (userDetail.name === userName && userDetail.email === email && userDetail.number === number) {
      Alert.alert('Warning', 'Please Change details to update profile')
    }
    else {
      Alert.alert('Warning',
        'Are You sure you want to update profile',
        [
          {
            text: 'Cancel',
            style: 'cancel'

          },
          {
            text: 'Ok',
            onPress: async () => {
              const db = getDatabase()
              const uid = auth.currentUser.uid
              const updateRef = ref(db, (`Users/${uid}`))
              await update(updateRef, {
                email: email,
                name: userName,
                number: number
              })
              Alert.alert('Success!', 'Profile Updated')
            }
          }
        ]
      )
    }
  }
  useEffect(() => {
    const getDetails = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          const user = JSON.parse(stored);
          setUserDetail(user)
          setUserName(user.name)
          setEmail(user.email)
          setNumber(user.number)
          setLoading(false)
        }
      } catch (e) {
        console.log(e)
      }
    };

    getDetails();
  }, []);
  return (
    <View>
      {
        loading ? (
          <View>
            <ActivityIndicator size={'large'} color='blue'/>
          </View>
        ) : (
          <View className='flex items-center'>
            <View className='w-24 h-24 flex items-center rounded-full my-6 justify-center bg-blue-300'>
              <Ionicons name='person-sharp' color={'#fff'} size={40} />
            </View>
            <View className='w-[90%] mb-2'>
              <Text className='font-bold pb-1'>User Name:</Text>
              <TextInput
                className='w-full bg-white pl-3 text-gray-600 font-bold rounded-lg'
                value={userName}
                onChangeText={setUserName}
              />
            </View>
            <View className='w-[90%] mb-2'>
              <Text className='font-bold pb-1'>Email:</Text>
              <TextInput
                className='w-full bg-white pl-3 text-gray-600 font-bold rounded-lg'
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View className='w-[90%] mb-2'>
              <Text className='font-bold pb-1'>Number:</Text>
              <TextInput
                className='w-full bg-white pl-3 text-gray-600 font-bold rounded-lg'
                value={number}
                onChangeText={setNumber}
              />
            </View>
            <TouchableOpacity className='bg-blue-400 w-[90%] mt-6 h-12 flex items-center rounded-lg justify-center' onPress={updateProfileData}>
              <Text className='text-white font-bold'>
                Update Profile
              </Text>
            </TouchableOpacity>
          </View>
        )
      }
    </View>
  )
}

export default ProfileScreen