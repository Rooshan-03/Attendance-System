import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Button, Alert, TouchableOpacity } from 'react-native';
import { get, ref } from 'firebase/database';
import { database } from '../firebase.config';
import { useRoute } from '@react-navigation/native';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';


const ShowAttendance = ({ navigation }) => {
    const [presentStudents, setPresentStudents] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [subjectName, setSubjectName] = useState('');
    const { uid, classId, subjectId } = useRoute().params;
    const db = database;

    useEffect(() => {
        const fetchData = async () => {
            // Get subject name
            const subjectSnapshot = await get(ref(db, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}`));
            if (subjectSnapshot.exists()) {
                setSubjectName(subjectSnapshot.val().subjectName);
            }

            // Get attendance
            const dateStr = getReadableDate();
            const snapshot = await get(ref(db, `Users/${uid}/Classes/${classId}/Subjects/${subjectId}/Attendance/${dateStr}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const students = Object.values(data).filter(student => student.present);
                setPresentStudents(students);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    React.useLayoutEffect(() => {
        navigation.setOptions({ title: subjectName });
    }, [navigation, subjectName]);

    const getReadableDate = () => {
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const exportToExcel = async () => {
        try {
            if (!presentStudents.length) {
                Alert.alert('No data', 'There are no students to export.');
                return;
            }
            const sheetName = `${subjectName} ${getReadableDate()}`;
            const ws = XLSX.utils.json_to_sheet(presentStudents);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

            const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
            const filePath = FileSystem.documentDirectory + `${sheetName}.xlsx`;

            await FileSystem.writeAsStringAsync(filePath, wbout, {
                encoding: 'base64',
            });

            await Sharing.shareAsync(filePath, {
                mimeType:
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                dialogTitle: 'Export Attendance',
                UTI: 'com.microsoft.excel.xlsx',
            });
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to export Excel file');
        }
    };

    const TableRow = ({ item, isHeader }) => (
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc', padding: 8, backgroundColor: isHeader ? '#eee' : 'white' }}>
            <Text style={{ flex: 1, fontWeight: 'bold' }}>{isHeader ? 'Name' : item.name}</Text>
            <Text style={{ flex: 1, fontWeight: 'bold' }}>{isHeader ? 'Roll No' : item.rollNo}</Text>
            <Text style={{ flex: 1, fontWeight: 'bold' }}>{isHeader ? 'Present' : item.present ? 'Yes' : 'No'}</Text>
        </View>
    );

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View className='flex-1'>
            <FlatList
                data={presentStudents}
                keyExtractor={item => item.rollNo.toString()}
                ListHeaderComponent={<TableRow isHeader />}
                renderItem={({ item }) => <TableRow item={item} />}
            />
            <TouchableOpacity className="w-30 h-15 absolute bottom-20 right-10 bg-blue-500 p-4 rounded-lg shadow-lg" onPress={exportToExcel}>
                <View className='flex justify-center items-center flex-row'>
                    <Ionicons name='share-social-sharp' color={'#fff'} />
                    <Text className='text-sm ml-2 text-white font-bold'>Share</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default ShowAttendance;