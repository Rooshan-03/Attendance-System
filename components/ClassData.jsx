import { ActivityIndicator, Alert, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebase.config.js';
import { get, getDatabase, push, ref, remove, set, update } from 'firebase/database';
import { Menu } from 'react-native-paper';

const ClassData = ({ navigation }) => {
    //useState Hooks for managing states
    const [modalVisible, setModalVisible] = useState(false)
    const [subjectName, setSubjectName] = useState('')
    const [subjects, setSubjects] = useState([])
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [loadingAddMore, setLoadingAddMore] = useState(false)
    const [isLoading, setLoading] = useState(true)
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [updateSubjectName, setUpdateSubjectName] = useState('')
    const [updateModalVisible, setUpdateModalVisible] = useState(false)
    const [id, setId] = useState('')
    const db = getDatabase()
    //Getting ClassName as prop from Home Screen
    const { className, classId } = useRoute().params


    const openItemMenu = (id) => setSelectedItemId(id)
    const closeItemMenu = () => {
        setSelectedItemId(null);
    };
    // fetching data in useEffexct Hook
    useEffect(() => {
        //fetching data from firebase
        const fetchSubjects = async () => {
            try {
                const uid = auth.currentUser.uid
                if (!uid) {
                    setLoading(false)
                    return;
                }
                const db = getDatabase()
                const snapshot = await get(ref(db, `Users/${uid}/Classes/${classId}/Subjects`))
                if (snapshot.exists()) {
                    const subjectArray = Object.entries(snapshot.val()).map(([key, value]) => ({
                        id: key,
                        ...value,
                    }))
                    setLoading(false)

                    setSubjects(subjectArray)
                } else {
                    setLoading(false)

                    setSubjects([])
                }
            } catch (error) {
                setLoading(false)

                console.log('Error Fetcing Subjects', error)
            }
        }
        fetchSubjects();
    }, [])

    // Using Classame as title and also displaying + on top to add subject
    useLayoutEffect(() => {
        navigation.setOptions({
            title: className || 'Class Data',
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={25} color="#000" />
                </TouchableOpacity>)
        });
    }, [navigation, className]);
    // Adding Subjects inside classes Path
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
            setSubjects((prev) => [...prev, { id: newSubjectRef.key, ...newSubjectData }])
            setModalVisible(false);
            setLoadingSubmit(false)
            setLoadingAddMore(false)
            setSubjectName('')
        } catch (error) {
            console.message(error)
        }
    }
    const RenderSubjects = ({ item }) => {
        const isMenuOpen = selectedItemId === item.id;
        return (
            <TouchableOpacity
                className="mx-3 my-1 bg-white rounded-2xl shadow-md flex-row items-center p-3"
                onPress={() => navigation.navigate('StudentsData', { subjectId: item.id, subjectName: item.subjectName, classId })}
            >
                <View className="w-8 h-8 bg-blue-100 rounded-full justify-center items-center mr-3">
                    <Ionicons name="book-outline" size={18} color="#2563EB" />
                </View>

                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">{item.subjectName}</Text>
                </View>
                <Menu
                    visible={isMenuOpen}
                    onDismiss={closeItemMenu}
                    anchor={
                        <TouchableOpacity onPress={() => openItemMenu(item.id)} className='pl-3 rounded-full w-10  h-7'>
                            <Ionicons name="ellipsis-vertical" size={18} color="grey" />
                        </TouchableOpacity>
                    }
                >
                    <Menu.Item title='Update' onPress={() => updateSubject(item)} />
                    <Menu.Item title='Delete' onPress={() => deleteSubject(item.id)} />
                </Menu>
            </TouchableOpacity>
        )
    }
    const handleUpdateSubmit = async () => {
        if (!updateSubjectName.trim()) {
            alert('Please Enter Subject Name')
            return;
        }
        console.log(id, updateSubjectName)
        const uid = auth.currentUser.uid
        console.log(id)
        const updateRef = ref(db, `Users/${uid}/Classes/${classId}/Subjects/${id}`)
        await update(updateRef, { subjectName: updateSubjectName })
        setSubjects(prev =>
            prev.map(s => s.id === id ? { ...s, subjectName: updateSubjectName } : s)
        )

        setUpdateSubjectName('')
        setUpdateModalVisible(false)
    }
    const updateSubject = (item) => {
        setId(item.id)
        setUpdateSubjectName(item.subjectName)
        closeItemMenu()
        setUpdateModalVisible(true);
    };

    const deleteSubject = async (subjectId) => {
        Alert.alert('Warning', 'Are You sure You want to delete this subject?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'

                },
                {
                    text: 'Ok',
                    onPress: async () => {
                        const uid = auth.currentUser.uid
                        const deleteRef = ref(db, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}`)
                        await remove(deleteRef)
                        setSubjects(prev => prev.filter(s => s.id !== subjectId));
                    }
                }
            ]
        )
    }
    return (
        <View className='flex-1'>
            <Modal
                animationType="slide"
                transparent
                visible={updateModalVisible}
                onRequestClose={() => setUpdateModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">

                    <View className='flex items-center justify-center p-6 m-3 bg-white w-[95%] rounded-lg '>
                        <Text className='font-sens font-bold m-3'>Edit Subject Name</Text>

                        <TextInput
                            placeholder='Subject Name to edit'
                            value={updateSubjectName}
                            onChangeText={setUpdateSubjectName}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 mb-3'
                        />
                        <View className='w-full'>
                            <TouchableOpacity className='w-full rounded-lg m-1 bg-green-500 flex items-center p-2 justify-center' onPress={handleUpdateSubmit} >
                                <Text className='text-white font-bold '>
                                    Update
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity className='w-full rounded-lg m-1 bg-slate-500 flex items-center p-2 justify-center' onPress={() => {
                                closeItemMenu();
                                setUpdateModalVisible(false);

                            }}
                            >
                                <Text className='text-white font-bold'>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal animationType='fade'
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className='w-4/5 bg-white rounded-lg items-center p-6'>
                        <Text className="text-lg font-bold mb-4 text-center">Enter Subject Name</Text>
                        <TextInput
                            placeholder='Subject'
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
            <View className="flex-1">
                {isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size={50} color="blue" />
                    </View>
                ) : subjects.length === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-red-500 font-extrabold">
                            No subjects Added Yet
                        </Text>
                    </View>
                ) : (
                    <View className="flex-1">
                        <FlatList
                            data={subjects}
                            keyExtractor={(item) => item.id}
                            renderItem={RenderSubjects}
                            className="flex-1 mt-3"
                        />
                    </View>
                )}

            </View>
        </View>
    )
}

export default ClassData