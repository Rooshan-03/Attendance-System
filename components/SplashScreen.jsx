import { View, Image } from 'react-native'
import React, { useEffect } from 'react'
import AppIcon from '../assets/AppIcon.jpeg';
import userLoggedInState from 'zustand/store';

const SplashScreen = ({ navigation }) => {
    const { checkUserState } = userLoggedInState();
    useEffect(() => {
        console.log(checkUserState())
        setTimeout(() => {
            if (checkUserState()) {
                navigation.navigate('Home')
            }
            else {
                navigation.navigate('Login')
            }
        },2000)
    }, [])
    return (
        <View className='flex-1'> 
            <View className="flex-1 justify-center items-center">
                <Image
                    source={AppIcon}
                    style={{ width: 100, height: 100 }}
                    resizeMode="contain"
                />
            </View>
        </View>
    )
}
export default SplashScreen