import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { get, getDatabase, ref, update } from 'firebase/database'
import { Ionicons } from '@expo/vector-icons'
import { useRoute } from '@react-navigation/native'
import { auth } from 'firebase.config'

const MarkAttendance = ({ navigation }) => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(false);
    //getting id and subject name using props from StudentsData Screen
    const { uid, classId, subjectId } = useRoute().params
    useEffect(() => {
        const fetchStudents = async () => {
            const uid = auth.currentUser.uid;
            if (!uid) {
                return
            }
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
        students.forEach(student => {
            updates[`Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Attendance/${Date}/${student.id}`] = {
                name: student.Name,
                rollNo: student.RollNo,
                present: student.present
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

    return (
        loading ? (
            <View className='flex-1 justify-center items-center'>
                <ActivityIndicator size="large" />
            </View>
        )
            : (
                <View className="flex-1 items-center justify-end">
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

                </View>
            )
    )
}

export default MarkAttendance;