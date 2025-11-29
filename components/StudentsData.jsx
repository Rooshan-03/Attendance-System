import React, { useLayoutEffect } from 'react'
import { View, Text, FlatList, Button, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useEffect, useState } from 'react'
import { auth } from 'firebase.config'
import { get, getDatabase, ref, push, set, update, remove } from 'firebase/database'
import { useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Menu } from 'react-native-paper'
const StudentsData = ({ navigation }) => {
    const [students, setStudents] = useState([])
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [roll, setRoll] = useState('');
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [loadingAddMore, setLoadingAddMore] = useState(false)
    const [className, setClassName] = useState('');
    const [isLoading, setLoading] = useState(true)
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [updateStudentName, setUpdateStudentName] = useState('')
    const [updateStudentRollNo, setUpdateStudentRollNo] = useState('')
    const [updateModalVisible, setUpdateModalVisible] = useState(false)
    const [selectdId,setId] = useState('')
    //getting id and subject name using props from ClassDAta Screen
    const { classId, subjectId, subjectName } = useRoute().params
    const db = getDatabase()
    const uid = auth.currentUser.uid


    const openItemMenu = (id) => setSelectedItemId(id)
    const closeItemMenu = () => setSelectedItemId(null)
    //Header Setting
    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Students',
            headerRight: () => (
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name='add-sharp' size={25} color={'#000'} />
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
                const subjectSnapshot = await get(ref(db, `Users/${uid}/Classes/${classId}`));
                if (subjectSnapshot.exists()) {
                    setClassName(subjectSnapshot.val().className);
                }
                const snapshot = await get(ref(db, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Students`))
                if (snapshot.exists()) {
                    const studentsArray = Object.entries(snapshot.val()).map(([key, value]) => ({
                        id: key,
                        ...value,
                    }));
                    setStudents(studentsArray)
                    setLoading(false)
                } else {
                    setLoading(false)
                }
            } catch (error) {
                Alert.alert('Warning', 'Something Went Wrong')
                setLoading(false)

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
    const updateStudent = async (student) => {
        setId(student.id)
        closeItemMenu()
        setUpdateStudentName(student.Name);
        setUpdateStudentRollNo(student.RollNo);
        setUpdateModalVisible(true);

    }
    const deleteStudent = async (studentId) => {
        Alert.alert('Warning',
            'Are You sure you want to delete this Student?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'

                },
                {
                    text: 'Ok',
                    onPress: async () => {
                        const uid = auth.currentUser.uid
                        const deleteRef = ref(db, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Students/${studentId}`)
                        await remove(deleteRef)
                        setStudents(prev => prev.filter(s => s.id !== studentId));
                    }
                }
            ]
        )
    }
    //Render Students   
    const RenderStudents = ({ item, number }) => {
        return (
            <View className="bg-white rounded-md flex-row flex justify-center items-center mb-2" style={{ borderBottomWidth: 0.3 }}>
                <Text className='mx-3'>{number + 1}</Text>

                <View className="flex-1 mx-2 p-1 mb-1">
                    <Text className="text-sm font-sens font-semibold">{item.Name}</Text>
                    <Text className="text-xs font-sens text-slate-500 mt[0.5]">{item.RollNo}</Text>
                </View>
                <Menu
                    visible={selectedItemId == item.id}
                    onDismiss={closeItemMenu}
                    anchor={
                        <TouchableOpacity
                            onPress={() => openItemMenu(item.id)}
                            className="w-8 h-8 mr-3 flex items-center justify-center rounded"
                        >
                            <Ionicons name="ellipsis-vertical" size={18} color="grey" />
                        </TouchableOpacity>

                    }
                >
                    <Menu.Item title='Update' onPress={() => updateStudent(item)} />
                    <Menu.Item title='Delete' onPress={() => deleteStudent(item.id)} />
                </Menu>
            </View>
        )
    }
    const handleUpdateSubmit = async () => {
        if (!updateStudentName.trim()) {
            alert('Please enter valid Student Name');
            return;
        }
        const nameExists = students.some(
            s => s.Name.toLowerCase() === updateStudentName.trim().toLowerCase() && s.id !== selectdId
        );
        if (nameExists) {
            alert('Student with this name already exists');
            return;
        }
        const rollNoExists = students.some(
            s => s.RollNo.toLowerCase() === updateStudentRollNo.trim().toLowerCase() && s.id !== selectdId
        );
        if (rollNoExists) {
            alert('Student with this Roll No exists');
            return;
        }

        const uid = auth.currentUser.uid
        const updateRef = ref(db, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Students/${selectdId}`)
        await update(updateRef, { Name: updateStudentName, RollNo: updateStudentRollNo })
        setStudents(prev =>
            prev.map(s => s.id === selectdId ? { ...s, Name: updateStudentName, RollNo: updateStudentRollNo } : s)
        )
        closeItemMenu()
        setUpdateModalVisible(false)
        setUpdateStudentName('')
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
                        <Text className='font-sens font-bold m-3'>Edit Student Name</Text>
                        <TextInput
                            placeholder='Class Name to edit'
                            value={updateStudentName}
                            onChangeText={setUpdateStudentName}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 mb-3'
                        />
                        <TextInput
                            placeholder='Roll No to edit'
                            value={updateStudentRollNo}
                            onChangeText={setUpdateStudentRollNo}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 mb-3'
                        />
                        <View className='w-full'>
                            <TouchableOpacity className='w-full rounded-lg m-1 bg-green-500 flex items-center p-2 justify-center' onPress={handleUpdateSubmit} >
                                <Text className='text-white font-bold '>
                                    Update
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity className='w-full rounded-lg m-1 bg-slate-500 flex items-center p-2 justify-center' onPress={() => { setUpdateModalVisible(false), closeItemMenu() }}>
                                <Text className='text-white font-bold'>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {
                isLoading ? (
                    <View className='flex-1 justify-center items-center'>
                        <ActivityIndicator color={'blue'} size={'large'} />
                    </View>
                ) : students.length === 0 ? (
                    <View className='flex-1 justify-center items-center'>
                        <View className='flex justify-center items-center h-[90%]'>
                            <Text className='text-red-600 font-extrabold'>No students</Text>
                        </View>

                    </View>
                ) : (
                    <View className='flex-1 items-center justify-center'>
                        <View className='w-[95%]  p-4 m-4 rounded-md bg-blue-200/90 '>
                            {/* First row(Class Name and subjectName) */}
                            <View className='flex flex-row justify-between mx-5'>
                                <View className='flex flex-row px-3 '>
                                    <Ionicons name='people-outline' className='mx-1' color={'#2563EB'} size={12} />
                                    <Text className='text-xs text-blue-700 font-bold'>{className}</Text>
                                </View>
                                <View className='flex flex-row px-3 '>
                                    <Ionicons name='book-outline' className='mx-1' color={'#2563EB'} size={12} />
                                    <Text className='text-xs text-blue-700 font-bold'>{subjectName}</Text>
                                </View>
                            </View>
                        </View>
                        <View className='w-[95%] max-h-[80%]  bg-white rounded-md'>
                            <FlatList
                                data={students}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item, index }) => <RenderStudents item={item} number={index} />}
                            />
                        </View>
                        <View className='flex-1 flex-row justify-center items-center'>

                            <View className='bg-white w-full h-28 absolute bottom-0 '>
                                <TouchableOpacity className="top-0 mx-6 h-12 flex flex-row justify-center bg-blue-400  rounded-md mt-5 items-center" onPress={() => navigation.navigate('MarkAttendance', { uid, subjectId, classId, subjectName })}>
                                    <Ionicons name='checkmark-done-outline' color={"#fff"} size={20} />
                                    <Text className="text-white ml-2 font-sens text-xl">
                                        Mark Attendance
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )
            }

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

        </View>
    )
}

export default StudentsData;