import React, { useLayoutEffect } from 'react'
import { View, Text, FlatList, Button, Modal, TextInput, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'
import { auth } from 'firebase.config'
import { get, getDatabase, ref, push, set } from 'firebase/database'
import { useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
const StudentsData = ({ navigation }) => {
    const [students, setStudents] = useState([])
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [roll, setRoll] = useState('');
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [loadingAddMore, setLoadingAddMore] = useState(false)
    //getting id and subject name using props from ClassDAta Screen
    const { classId, subjectId, subjectName } = useRoute().params
    //Header Setting
    useLayoutEffect(() => {
        navigation.setOptions({
            title: subjectName,
            headerRight: () => (
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name='add' size={28} color='blue' />
                </TouchableOpacity>
            )
        })
    })
    //UseEffect
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const uid = auth.currentUser.uid;
                if (!uid) {
                    return
                }
                const db = getDatabase()
                const snapshot = await get(ref(db, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Students`))
                if (snapshot.exists()) {
                    const studentsArray = Object.entries(snapshot.val()).map(([key, value]) => ({
                        id: key,
                        ...value,
                    }));
                    setStudents(studentsArray)
                }
                else {
                    console.log('Error', 'No students Found')
                }
            } catch (error) {
                console.log('Error', error)
            }
        }
        fetchStudents();
    }, [])
    //handle Submit
    const handleSubmit = async () => {
        if (!name || !roll) {
            alert('Please enter both name and roll number');
            setLoadingSubmit(false)
            setLoadingAddMore(false)
            return;
        }
        try {
            const uid = auth.currentUser.uid;
            const db = getDatabase();
            const newStudentRef = push(ref(db, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Students`));
            const studentData = {
                Name: name,
                RollNo: roll
            };

            await set(newStudentRef, studentData);
            setStudents((prev) => [...prev, { id: newStudentRef.key, ...studentData }]);
            setName('');
            setRoll('');
            setLoadingSubmit(false)
            setLoadingAddMore(false)
            setModalVisible(false);

        } catch (error) {
            console.log('Error adding student:', error);
        }
    };
    //Render Students


    const RenderStudents = ({ item }) => {
        return (
            <View className="bg-white mx-4 my-2 p-4 rounded-2xl shadow-sm border border-gray-100 flex-row items-center">
                {/* Icon */}
                <View className="bg-blue-100 p-3 rounded-full mr-4">
                    <Ionicons name="person-circle-outline" size={28} color="#2563EB" />
                </View>

                {/* Student Info */}
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">{item.Name}</Text>
                    <Text className="text-sm text-gray-500 mt-1">Roll No: {item.RollNo}</Text>
                </View>

                {/* Optional Right Icon */}
                <Ionicons name="chevron-forward-outline" size={22} color="#9CA3AF" />
            </View>
        )
    }
    return (
        <View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="w-4/5 bg-white rounded-lg p-6 items-center">
                        <Text className="text-lg font-bold mb-4 text-center">
                            Enter Name and Roll Number
                        </Text>

                        <TextInput
                            placeholder="Name"
                            value={name}
                            onChangeText={setName}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
                        />

                        <TextInput
                            placeholder="Roll Number"
                            value={roll}
                            onChangeText={setRoll}
                            keyboardType="numeric"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
                        />

                        <View className="flex-row justify-between w-full">

                            <TouchableOpacity
                                className="w-[48%] bg-green-500 rounded-md py-2 mb-2"
                                onPress={async () => {
                                    await handleSubmit();
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
                                    await handleSubmit();
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
            {/* Displaying Students  */}
            <FlatList
                data={students}
                keyExtractor={(item) => item.id}
                renderItem={RenderStudents}
                ListEmptyComponent={<Text style={{ padding: 20 }}>Loading students...</Text>}
            />
        </View>

    )
}

export default StudentsData