import { TouchableOpacity, View } from 'react-native'
import React, { useLayoutEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ClassData = ({ navigation }) => {
    const [modal,setModal] = useState('')
    //Getting ClassName as prop from Home Screen
    const {className } = useRoute().params
    // Using Classame as title and also displaying + on top to add subject
    useLayoutEffect(() => {
        navigation.setOptions({
            title: className || 'Class Data',
            headerRight :()=>(
                <TouchableOpacity>
                    <Ionicons name='add' size={28} color='blue'/>
                </TouchableOpacity>
            )
        });
    }, [navigation, className]);



    return (
        <View>

        </View>
    )
}

export default ClassData