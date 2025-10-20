import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { get, getDatabase, ref } from 'firebase/database'
import { Ionicons } from '@expo/vector-icons'
import { useRoute } from '@react-navigation/native'
import SafeAreaView from 'react-native-safe-area-context'
const MarkAttendance = () => {
    const [students, setStudents] = useState([])
    const { uid, classId, subjectId } = useRoute().params
    useEffect(() => {
        const fetchStudents = async () => {
            const db = getDatabase()
            const snapshot = await get(ref(db, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Students`))
            if (snapshot.exists()) {
                const data = snapshot.val()
                const list = Object.entries(data).map(([key, val]) => ({
                    id: key,
                    ...val,
                    present: true
                }))
                setStudents(list)
            }
        }
        fetchStudents()
    }, [])
    const toggleAttendance = (id) => {
        setStudents((prev) =>
            prev.map((student) =>
                student.id === id ? { ...student, present: !student.present } : student
            )
        )
    }
    const RenderItem = ({ item }) => {
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
                <TouchableOpacity
                    className={`rounded-lg m-2 p-3 ${item.present ? 'bg-green-400' : 'bg-red-500'}`}
                    onPress={() => toggleAttendance(item.id)}
                >
                    <Text className='text-white font-extrabold'>
                        {item.present ? 'Present' : 'Absent'}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
    const submitAttendance = async () => {
        const db = getDatabase();
        students.forEach(student => {
            set(ref(db, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Students/${student.id}/Attendance/${Date.now()}`), {
                present: student.present
            });
        });
        alert('Attendance marked successfully!');
    };

    return (
        <SafeAreaView className="flex-1 items-center justify-end">
            <FlatList
                data={students}
                renderItem={RenderItem}
                keyExtractor={item => item.id}
                className="flex-1 w-full"
                contentContainerStyle={{ paddingBottom: 30 }}
            />

            <TouchableOpacity className="bg-blue-400 w-11/12 p-2 rounded-lg items-center shadow-lg mb-10" onPress={submitAttendance}>
                <Text className="text-white font-bold text-2xl">
                    Submit Attendance
                </Text>
            </TouchableOpacity>
        </SafeAreaView>

    )
}

export default MarkAttendance