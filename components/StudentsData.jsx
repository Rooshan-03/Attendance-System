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
    const uid = auth.currentUser.uid
    //Header Setting
    useLayoutEffect(() => {
        navigation.setOptions({
            title: subjectName
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

        } catch (error) {
            console.log('Error adding student:', error);
        }
    };
    //Render Students   
    const RenderStudents = ({ item, number }) => {
        return (
            <View className="bg-white mx-4 p-2 flex-row items-center" style={{ borderBottomWidth: 0.5 }}>
                <View className="p-2 rounded-full ml-2 mr-4">
                    <Text>{number + 1}</Text>
                </View>

                <View className="flex-1 items-center mr-8">
                    <Text className="text-sm font-sens font-medium text-gray-800">{item.Name}</Text>
                    <Text className="text-xs font-sens text-gray-500 mt[0.5]">{item.RollNo}</Text>
                </View>
            </View>
        )
    }

    return (
        <View className='flex-1'>
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
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
                        />

                        <View className="flex-row justify-between w-full">

                            <TouchableOpacity
                                className="w-[48%] bg-green-500 rounded-md py-2 mb-2"
                                onPress={async () => {
                                    await handleSubmit();
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

            <FlatList
                data={students}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => <RenderStudents item={item} number={index} />}
                className='mb-20'
                ListEmptyComponent={<Text className='p-20 flex-1 justify-center items-start'>Loading students...</Text>}
            />
            <View className='absolute bottom-20 right-5'>
                <TouchableOpacity className="absolut left-10 w-14 h-14 bg-blue-400 p-4 m-2 rounded-full shadow-lg flex justify-center items-center" onPress={() => setModalVisible(true)}>
                    <Ionicons name='add-sharp' size={20} color={'#fff'} />
                </TouchableOpacity>
                <TouchableOpacity className="w-30 h-15 right-10 bg-blue-500 p-4 rounded-lg shadow-lg" onPress={() => navigation.navigate('MarkAttendance', { uid, subjectId, classId, subjectName })}>
                    <View className='flex justify-center items-center flex-row'>
                        <Ionicons name='checkmark-done-circle-outline' size={15} color={'#fff'} />
                        <Text className='text-sm ml-2 text-white font-bold'>Mark Attendance</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default StudentsData