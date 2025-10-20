import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useLayoutEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from 'firebase.config';
import { getDatabase, push, ref, set } from 'firebase/database';

const ClassData = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState('')
    const [subjectName, setSubjectName] = useState('')
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [loadingAddMore, setLoadingAddMore] = useState(false)
    //Getting ClassName as prop from Home Screen
    const { className, classId } = useRoute().params
    // Using Classame as title and also displaying + on top to add subject
    useLayoutEffect(() => {
        navigation.setOptions({
            title: className || 'Class Data',
            headerRight: () => (
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name='add' size={28} color='blue' />
                </TouchableOpacity>
            )
        });
    }, [navigation, className]);

    const handleSubmitSubject = async () => {

        try {
            if (!subjectName.trim()) {
                alert('Please Enter Subject Name:')
                setLoadingSubmit(false)
                setLoadingAddMore(false)
                return;
            }
            const uid = auth.currentUser.uid
            if (!uid) {
                return;
            }
            const db = getDatabase()
            const newSubjectRef = push(ref(db, `Users/${uid}/Classes/${classId}/Subjects`))
            const newSubjectData = { subjectName }
            await set(newSubjectRef, newSubjectData)
            setSubjectName((prev) => [...prev, { id: newSubjectRef.key, ...newSubjectData }])
            setModalVisible(false);
            setLoadingSubmit(false)
            setLoadingAddMore(false)
            setSubjectName('')
        } catch (error) {
            console.message(error)
        }
    }

    return (
        <View>
            <Modal animationType='fade'
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className='w-4/5 bg-white rounded-lg items-center p-6'>
                        <Text className="text-lg font-bold mb-4 text-center">Enter Subject Name</Text>
                        <TextInput
                            placeholder='Suvject'
                            value={subjectName}
                            onChangeText={setSubjectName}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
                        />
                        <View className="flex-row justify-between w-full">

                            <TouchableOpacity
                                className="w-[48%] bg-green-500 rounded-md py-2 mb-2"
                                onPress={async () => {
                                    await handleSubmitSubject();
                                    setModalVisible(true);
                                }}
                            >{loadingAddMore ? (
                                <ActivityIndicator size="small" color="#192130" />
                            ) : (
                                <Text className="text-white text-center font-bold">Add More</Text>
                            )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="w-[48%] bg-blue-500 rounded-md py-2 mb-2"
                                onPress={async () => {
                                    await handleSubmitSubject();
                                    setModalVisible(false);
                                }}                            >
                                {loadingSubmit ? (
                                    <ActivityIndicator size="small" color="#192130" />
                                ) : (
                                    <Text className="text-white text-center font-bold">Submit</Text>
                                )}
                            </TouchableOpacity>

                        </View>

                        <TouchableOpacity
                            className="w-full bg-gray-400 rounded-md py-2"
                            onPress={() => setModalVisible(false)}
                        >
                            <Text className="text-white text-center font-bold">Cancel</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </Modal>
        </View>
    )
}

export default ClassData