import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { get, getDatabase, ref, update } from 'firebase/database'
import { Ionicons } from '@expo/vector-icons'
import { useRoute } from '@react-navigation/native'
import { auth } from 'firebase.config'
import RadioButton from './RadioButton'

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
                    Attendance: "p"
                }))
                setStudents(list)
            }
        }
        fetchStudents()
    }, [])

    const RenderItem = ({ item }) => {
        const updateStatus = (value) => {
            setStudents(prev =>
                prev.map(s => s.id == item.id ? { ...s, Attendance: value } : s)
            )
        }
        return (
            <View className="bg-white mx-3 my-1 p-4 rounded-xl border border-gray-200 flex-row items-center">
                {/* Icon */}
                <View className="bg-blue-100 p-2 rounded-full mr-4">
                    <Ionicons name="person-circle-outline" size={20} color="#2563EB" />
                </View>

                {/* Student Info */}
                <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-800">{item.Name}</Text>
                    <Text className="text-xs text-gray-500"> {item.RollNo}</Text>
                </View>
                <View className='flex justify-center items-center flex-row'>
                    <RadioButton
                        label={'P'}
                        color={'bg-gray-300'}
                        selectedColor={'bg-green-400'}
                        onPress={() => { updateStatus("P") }}
                        selected={item.Attendance === "P"}
                    />
                    <RadioButton
                        label={'A'}
                        color={'bg-gray-200'}
                        selectedColor={'bg-red-500'}
                        onPress={() => { updateStatus("A") }}
                        selected={item.Attendance === "A"}
                    />
                    <RadioButton
                        label={'L'}
                        color={'bg-gray-200'}
                        selectedColor={'bg-blue-400'}
                        onPress={() => { updateStatus("L") }}
                        selected={item.Attendance === "L"}
                    />
                </View>
            </View>
        )
    }
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

    return (
        loading ? (
            <View className='flex-1 justify-center items-center'>
                <ActivityIndicator size="large" />
            </View>
        )
            : (
                <View className="flex-1 items-center ">
                    <FlatList
                        data={students}
                        renderItem={RenderItem}
                        keyExtractor={item => item.id}
                        className="w-full h-4/5"
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />

                    <TouchableOpacity className="absolute bottom-14 bg-blue-400 w-11/12 p-2 rounded-lg items-center shadow-lg" onPress={showDialog}>
                        <Text className="text-white font-semibold text-xl">
                            Submit Attendance
                        </Text>
                    </TouchableOpacity>
                </View>
            )
    )
}

export default MarkAttendance;