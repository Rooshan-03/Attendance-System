import { View, Text, ScrollView, FlatList, Button, Modal, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { auth } from 'firebase.config'
import { get, getDatabase, ref, push, set } from 'firebase/database'
const Home = () => {
    const [students, setStudents] = useState([])
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [roll, setRoll] = useState('');
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const uid = auth.currentUser.uid;
                if (!uid) {
                    return
                }
                const db = getDatabase()
                const snapshot = await get(ref(db, `Users/${uid}/Students`))
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
    const handleSubmit = async () => {
        if (!name || !roll) {
            alert('Please enter both name and roll number');
            return;
        }
        try {
            const uid = auth.currentUser.uid;
            const db = getDatabase();
            const newStudentRef = push(ref(db, `Users/${uid}/Students`));

            const studentData = {
                Name: name,
                RollNo: roll
            };

            await set(newStudentRef, studentData);
            setStudents((prev) => [...prev, { id: newStudentRef.key, ...studentData }]);
            setName('');
            setRoll('');
            setModalVisible(false);

        } catch (error) {
            console.log('Error adding student:', error);
        }
    };



    const RenderStudents = ({ item }) => {
        return (
            <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                <Text>Name: {item.Name}</Text>
                <Text>Roll No: {item.RollNo}</Text>
            </View>
        )
    }
    return (
        <View>
            <Button title='Add Student' onPress={() => { setModalVisible(true) }} />

            {/* Custom Dialoug for adding student */}
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
                            keyboardType="numeric"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
                        />

                        <TouchableOpacity
                            className="w-full bg-blue-500 rounded-md py-2 mb-2"
                            onPress={handleSubmit}
                        >
                            <Text className="text-white text-center font-bold">Submit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-full bg-gray-400 rounded-md py-2"
                            onPress={() => setModalVisible(false)}
                        >
                            <Text className="text-white text-center font-bold">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
             {/* Displaying Students  */}
            <FlatList
                data={students}
                keyExtractor={(item) => item.id}
                renderItem={RenderStudents}
                ListEmptyComponent={<Text style={{ padding: 20 }}>Loading students...</Text>}

            />
        </View>
    )
}

export default Home