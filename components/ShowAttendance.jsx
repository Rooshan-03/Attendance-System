import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { get, ref } from 'firebase/database';
import { database } from 'firebase.config';
import { useRoute } from '@react-navigation/native';

const ShowAttendance = ({ navigation }) => {
    const [presentStudents, setPresentStudents] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [subjectName, setSubjectName] = useState('')
    const { uid, classId, subjectId } = useRoute().params
    const db = database
    const getSubjectNameForHeader = async () => {
        const subjectSnapshot = await get(ref(db, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}`))
        if (subjectSnapshot.exists()) {
            const data = subjectSnapshot.val()
            const Name = data.subjectName
            setSubjectName(Name)
        }
    }
    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: subjectName
        });
    }, [navigation, subjectName]);
    const getReadableDate = () => {
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };
    useEffect(() => {
        const getPresentStudents = async () => {
            const Date = getReadableDate()
            const snapshot = await get(ref(db, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Attendance/${Date}`))
            if (snapshot.exists()) {
                const data = snapshot.val()
                const students = Object.values(data).filter(student => student.present)
                setPresentStudents(students)
                setLoading(false)
            }
            else {
                setLoading(false)
                setPresentStudents([]);
            }
        }
        getPresentStudents()
        getSubjectNameForHeader()
    }, [])
    const TableRow = ({ item, isHeader }) => {
        return (
            <View className={`flex-row border-b border-gray-300 ${isHeader ? 'bg-gray-200' : ''} p-2`}>
                <Text className="flex-1 font-bold">{isHeader ? 'Name' : item.name}</Text>
                <Text className="flex-1 font-bold">{isHeader ? 'Roll No' : item.rollNo}</Text>
                <Text className="flex-1 font-bold">{isHeader ? 'Present' : (item.present ? 'Yes' : 'No')}</Text>
            </View>
        );
    };
    return (

        isLoading ? (
            <View className='flex-1 justify-center items-center'>
                <ActivityIndicator size={'large'} />
            </View>
        ) : (
            <View>
                <FlatList
                    data={presentStudents}
                    keyExtractor={(item) => item.rollNo.toString() }
                    ListHeaderComponent={<TableRow isHeader />}
                    renderItem={({ item }) => <TableRow item={item} />} />
            </View>
        )

    )
}

export default ShowAttendance