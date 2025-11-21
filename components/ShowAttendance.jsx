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
                const students = Object.values(data);
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
            const formattedData = presentStudents.map(student => ({
                Name: student.name,
                'Roll Number': student.rollNo,
                Attendance: student.Attendance
            }));

            const sheetName = `${subjectName} ${getReadableDate()}`;
            const ws = XLSX.utils.json_to_sheet(formattedData, { header: ['Name', 'Roll Number', 'Attendance'] });
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


    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    const RenderStudents = ({ item }) => {
        return (
            <View className="flex-row p-2 border-b border-gray-300 items-center">
                {/* Name - fixed width or flex basis */}
                <Text className="w-40 text-xs ps-5 text-left">{item.name}</Text>

                {/* Roll No */}
                <Text className="w-40 text-xs text-left">{item.rollNo}</Text>

                {/* Attendance */}
                <Text className="flex-1 text-xs mr-11 text-center">{item.Attendance}</Text>
            </View>
        )
    }


    return (
        <View className='flex-1'>
            {/* Header */}
            <View className="flex-row bg-gray-400 p-2 items-center">
                <Text className="flex-[0.3] ml-4 text-left font-bold text-white text-sm">
                    Name
                </Text>
                <Text className="flex-[0.3] text-center font-bold text-white text-sm">
                    Roll No
                </Text>
                <Text className="flex-[0.3] ml-4 text-right font-bold text-white text-sm">
                    Attendance
                </Text>
            </View>
            
            <FlatList
                data={presentStudents}
                keyExtractor={item => item.rollNo.toString()}
                renderItem={RenderStudents}
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