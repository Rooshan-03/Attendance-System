import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

const RadioButtonComponent = ({ label, textColor, color, selectedColor, selected, onPress }) => {
  return (
    <TouchableOpacity className='m-1' onPress={onPress}>
      <View className={`w-7 h-7 rounded-full justify-center items-center  ${selected ? selectedColor : color} `}
        >
        <Text className={`text-xs font-bold  ${selected ? textColor : " text-black"}`}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  )
}
const RadioButton = React.memo(RadioButtonComponent);
export default RadioButton