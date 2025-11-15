import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

const RadioButton = ({label,color,selectedColor,selected,onPress}) => {
  return (
  <TouchableOpacity className='m-1' onPress={onPress}>
    <View className={`w-7 h-7 rounded-full justify-center items-center ${selected? selectedColor: color}`}>
        <Text className={`text-base font-bold  ${selected? "text-white":" text-black"}`}>
            {label}
        </Text>
    </View>
  </TouchableOpacity>
  )
}

export default RadioButton