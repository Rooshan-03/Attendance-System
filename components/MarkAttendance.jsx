import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { get, getDatabase, ref, update } from 'firebase/database';
import { useFocusEffect, useRoute } from '@react-navigation/native'
import { auth } from '../firebase.config.js';
import RadioButton from './RadioButton'
import { Ionicons } from '@expo/vector-icons';

const MarkAttendance = ({ navigation }) => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true);
    const [className, setClassName] = useState('');
    //getting id and subject name using props from StudentsData Screen
    const { classId, subjectId, subjectName } = useRoute().params

    const db = getDatabase()
    const uid = auth.currentUser.uid
    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    if (!uid) {
                        return
                    }
                    const subjectSnapshot = await get(ref(db, `Users/${uid}/Classes/${classId}`));
                    if (subjectSnapshot.exists()) {

                        setClassName(subjectSnapshot.val().className);

                    }

                    const snapshot = await get(ref(db, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Students`))
                    if (snapshot.exists()) {
                        const data = snapshot.val()

                        const list = Object.entries(data).map(([key, val]) => ({
                            id: key,
                            ...val,
                            Attendance: "P"
                        }))
                        setStudents(list)
                        setLoading(false)
                    }
                } catch (error) {
                    Alert.alert("Error", "Something Went Wrong!")
                }
            }
            fetchData()
        }, [])
    );
    const updateStatus = useCallback((studentId, value) => {
        setStudents(prev =>
            prev.map(s => s.id === studentId ? { ...s, Attendance: value } : s)
        );
    }, []);


    const showDialog = () => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to Submit Attendance?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: () => submitAttendance() }
            ],
            { cancelable: true }
        );
    };
    const getReadableDate = () => {
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };
    const submitAttendance = async () => {
        setLoading(true);
        const db = getDatabase();
        const Date = getReadableDate();
        const todayRef = ref(db, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Attendance/${Date}`)
        const snapshot = await get(todayRef)
        if (snapshot.exists()) {
            setLoading(false)
            alert(`Attendance Taken For ${Date}`)
            navigation.navigate('ShowAttendance', { uid, subjectId, classId })
            return
        }
        const updates = {};
        let checkMissingStudents = students.some(s => s.Attendance == null);
        if (checkMissingStudents) {
            setLoading(false)
            Alert.alert("Error", "Please Mark Attendance for All students")
            return;
        }
        students.forEach(student => {
            updates[`Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Attendance/${Date}/${student.id}`] = {
                name: student.Name,
                rollNo: student.RollNo,
                Attendance: student.Attendance
            };
        });

        try {

            await update(ref(db), updates);
            setLoading(false)
            alert('Attendance marked successfully!');
            navigation.navigate('ShowAttendance', { uid, subjectId, classId })
        } catch (error) {
            setLoading(false)
            console.error("Error marking attendance:", error);
            alert('Failed to mark attendance.');
        }
    };
    const getFormattedTime = () => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const mins = minutes < 10 ? `0${minutes}` : minutes;
        return `${hours}:${mins} ${ampm}`;
    }
    const present = React.useMemo(() => students.filter(s => s.Attendance === "P").length, [students]);
    const Absent = React.useMemo(() => students.filter(s => s.Attendance === "A").length, [students]);
    const Leave = React.useMemo(() => students.filter(s => s.Attendance === "L").length, [students]);


    const RenderItem = useMemo(() => {
        const Item = React.memo(({ item, number }) => {
            const onP = () => updateStatus(item.id, "P");
            const onA = () => updateStatus(item.id, "A");
            const onL = () => updateStatus(item.id, "L");
            return (
                <View className="w-full bg-white p-2 flex-row" style={{ borderBottomWidth: 0.3 }}>
                    <View className=" p-2  mr-4">
                        <Text>{number + 1}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-800">{item.Name}</Text>
                        <Text className="text-xs text-gray-500"> {item.RollNo}</Text>
                    </View>
                    <View className='flex justify-center items-center flex-row'>
                        <RadioButton
                            label={'P'}
                            color={'bg-gray-300'}
                            textColor={'text-green-700'}
                            selectedColor={'bg-green-200'}
                            onPress={onP}
                            selected={item.Attendance === "P"}
                        />
                        <RadioButton
                            label={'A'}
                            color={'bg-gray-200'}
                            selectedColor={'bg-red-200'}
                            textColor={'text-red-700'}
                            onPress={onA}
                            selected={item.Attendance === "A"}
                        />
                        <RadioButton
                            label={'L'}
                            color={'bg-gray-200'}
                            selectedColor={'bg-yellow-200'}
                            textColor={'text-yellow-600'}
                            onPress={onL}
                            selected={item.Attendance === "L"}
                        />
                    </View>
                </View>
            )
        })
        return Item;
    }, [updateStatus])
    return (
        loading ? (
            <View className='flex-1 justify-center items-center'>
                <ActivityIndicator size="large" />
            </View>
        ) : (
            <View className="flex-1 items-center">
                {/* Top View for Details */}
                <View className='w-[95%] flex flex-col mt-2 p-2 rounded-md border border-blue-200 bg-blue-200/90 '>
                    {/* First row(Class Name and subjectName) */}
                    <View className='flex flex-row justify-between mx-5'>
                        <View className='flex flex-row px-3 m-2'>
                            <Ionicons name='people-outline' className='mx-1' color={'#2563EB'} size={12} />
                            <Text className='text-xs text-blue-700 font-bold'>{className}</Text>
                        </View>
                        <View className='flex flex-row px-3 m-2'>
                            <Ionicons name='book-outline' className='mx-1' color={'#2563EB'} size={12} />
                            <Text className='text-xs text-blue-700 font-bold'>{subjectName}</Text>
                        </View>
                    </View>
                    {/* 2nd row time anda date */}
                    <View className='flex flex-row justify-between mx-5'>
                        <View className='flex flex-row px-3 m-2'>
                            <Ionicons name='today-outline' className='mx-1' color={'#2563EB'} size={12} />
                            <Text className='text-xs text-blue-700 font-bold'>{getReadableDate()}</Text>
                        </View>
                        <View className='flex flex-row px-3 m-2'>
                            <Ionicons name='time-outline' className='mx-1' color={'#2563EB'} size={12} />
                            <Text className='text-xs text-blue-700 font-bold'>{getFormattedTime()}</Text>
                        </View>
                    </View>
                </View>
                {/* Attendance Details*/}
                <View className='w-[95%] flex flex-row mt-2 mx-2 justify-center items-center'>
                    {/* present students */}
                    <View className='w-[30%] m-2 h-20 bg-white rounded-lg p-3  '>
                        <Text className='text-gray-500 font-semibold'>Present</Text>
                        <View className='mt-3 flex flex-row'>
                            <View className='w-3 h-3 bg-green-600 rounded-full' />
                            <Text className='text-xs pl-1'>{present}</Text>
                        </View>
                    </View>
                    {/* Absent Students */}
                    <View className='w-[30%] m-2 h-20 bg-white rounded-lg p-3'>
                        <Text className='font-semibold text-gray-500 '>Absent</Text>
                        <View className='mt-3 flex flex-row'>
                            <View className='w-3 h-3 bg-red-600 rounded-full' />
                            <Text className='text-xs pl-1'>{Absent}</Text>
                        </View>
                    </View>
                    {/* Students On loave */}
                    <View className='w-[30%] m-2 h-20 bg-white rounded-lg p-3'>
                        <Text className='font-semibold text-gray-500 '>Leave</Text>
                        <View className='mt-3 flex flex-row'>
                            <View className='w-3 h-3 bg-yellow-400 rounded-full' />
                            <Text className='text-xs pl-1'>{Leave}</Text>
                        </View>
                    </View>
                </View>
                {/* Flatlist started */}
                <View className="w-[95%] h-4/5 mt-3 pb-40" >
                    <FlatList
                        className='rounded-md'
                        data={students}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => (
                            <RenderItem
                                item={item}
                                number={index}
                            />
                        )
                        }
                        
                    />
                </View>
                <View className='bg-white w-full h-28 absolute bottom-0 '>
                    <TouchableOpacity className="top-0 mx-6 h-12 flex flex-row justify-center bg-blue-400  rounded-md mt-5 items-center" onPress={showDialog}>
                        <Ionicons name='send' color={"#fff"} size={20} />
                        <Text className="text-white ml-2 font-sens text-xl">
                            Submit Attendance
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    )
}

export default MarkAttendance;