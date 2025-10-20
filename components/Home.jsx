import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { auth } from 'firebase.config';
import { get, getDatabase, ref, push, set } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

const Home = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [className, setClassName] = useState('');
    const [classes, setClasses] = useState([]);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingAddMore, setLoadingAddMore] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const uid = auth.currentUser?.uid;
                if (!uid) return;
                const db = getDatabase();
                const snapshot = await get(ref(db, `Users/${uid}/Classes`));
                if (snapshot.exists()) {
                    const classesArray = Object.entries(snapshot.val()).map(([key, value]) => ({
                        id: key,
                        ...value,
                    }));
                    setClasses(classesArray);
                    setLoadingClasses(false)
                } else {
                    setClasses([]);
                    setLoadingClasses(false)
                }
            } catch (error) {
                setLoadingClasses(false)
                console.log('Error fetching classes:', error);
            }
        };
        fetchClasses();
    }, []);

    const handleSubmit = async () => {
        if (!className.trim()) {
            alert('Please enter a class name');
            return;
        }
        setLoadingSubmit(true);
        setLoadingAddMore(true);
        try {
            if (classes.some(c => c.className.toLowerCase() === className.trim().toLowerCase())) {
                alert('This class already exists!');
                return;
            }
            const uid = auth.currentUser?.uid;
            if (!uid) return;
            const db = getDatabase();
            const newClassRef = push(ref(db, `Users/${uid}/Classes`));
            const newClassData = { className };
            await set(newClassRef, newClassData);

            setClasses(prev => [...prev, { id: newClassRef.key, ...newClassData }]);
            setClassName('');
        } catch (error) {
            console.log('Error adding class:', error);
        } finally {
            setLoadingSubmit(false);
            setLoadingAddMore(false);
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => setModalVisible(true)} className="mr-4">
                    <Ionicons name="add" size={28} color="blue" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const RenderClass = ({ item }) => (
        <TouchableOpacity
            className="bg-white shadow-md rounded-xl p-4 m-2 flex-row justify-between items-center"
            onPress={() => navigation.navigate('ClassData', { className: item.className, classId: item.id })}
        >
            <Text className="text-base">📘 {item.className}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1">
            {/* Modal */}
            <Modal
                animationType="slide"
                transparent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="w-4/5 bg-white rounded-xl p-6 items-center">
                        <Text className="text-lg font-bold mb-4 text-center">Enter Class Name:</Text>
                        <TextInput
                            placeholder="Class Name"
                            value={className}
                            onChangeText={setClassName}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
                        />

                        <View className="flex-row justify-between w-full mb-3">
                            <TouchableOpacity
                                className="w-[48%] bg-green-500 rounded-md py-2"
                                onPress={async () => {
                                    await handleSubmit();
                                    setModalVisible(true);
                                }}
                            >
                                {loadingAddMore ? (
                                    <ActivityIndicator size="small" color="#192130" />
                                ) : (
                                    <Text className="text-white font-bold text-center">Add More</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="w-[48%] bg-blue-500 rounded-md py-2"
                                onPress={async () => {
                                    await handleSubmit();
                                    setModalVisible(false);
                                }}
                            >
                                {loadingSubmit ? (
                                    <ActivityIndicator size="small" color="#192130" />
                                ) : (
                                    <Text className="text-white font-bold text-center">Submit</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            className="w-full bg-gray-400 rounded-md py-2"
                            onPress={() => setModalVisible(false)}
                        >
                            <Text className="text-white font-bold text-center">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Loader or Class List */}
            {loadingClasses ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="blue" />
                </View>
            ) : (
                <FlatList
                    data={classes}
                    keyExtractor={item => item.id}
                    renderItem={RenderClass}
                    contentContainerStyle={classes.length === 0 ? { flex: 1 } : undefined}
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-red-500 font-bold text-xl">No Classes Yet..</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default Home;    