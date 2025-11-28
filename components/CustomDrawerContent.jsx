import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const CustomDrawerContent = (props) => {
  
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  return (
    <View className='flex-1'>
      <DrawerContentScrollView {...props}>
        <View>
          <View className='flex flex-row items-center ml-3'>
            <View className='w-14 h-14 bg-blue-300 flex items-center justify-center rounded-full mx-2'>
              <Ionicons name='person-sharp' size={30} color={"#FFF"} />
            </View>
            <Text className='font-sens font-extrabold text-gray-500 '>Rooshan Ali</Text>
          </View>
          <View className='w-full h-[0.4] bg-slate-500 mt-2'></View>
          <Text className='font-sens font-extrabold text-gray-500 m-2'>+92-3247692198</Text>
          <View className='w-full h-[0.4] bg-slate-500 my-2'></View>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View>
        <TouchableOpacity
          onPress={handleLogout}
        >
          <Text>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


export default CustomDrawerContent;