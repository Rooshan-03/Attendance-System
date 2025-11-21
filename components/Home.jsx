import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { auth } from 'firebase.config';
import { getDatabase, ref, push, set, onValue, get } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

const Home = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [className, setClassName] = useState('');
    const [classes, setClasses] = useState([]);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingAddMore, setLoadingAddMore] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(true);

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity className='mx-3' onPress={toggleDrawer}>
                    <Ionicons name='menu' size={20} />
                </TouchableOpacity>
            ),
            headerTitle: "Classes"
        })
        const toggleDrawer = () => {

        }
        const db = getDatabase();
        const uid = auth.currentUser?.uid;
        if (!uid) {
            return;
        }
        const fetchClasses = async () => {
            const classesRef = ref(db, `Users/${uid}/Classes`);
            const snapshot = await get(classesRef)
            if (snapshot.exists()) {
                const classesArray = Object.entries(snapshot.val()).map(([key, value]) => ({
                    id: key,
                    ...value,
                }))
                setLoadingClasses(false)
                setClasses(classesArray);
            } else {
                setLoadingClasses(false)
                setClasses([]);
            }
        }
        fetchClasses()
    }, [])
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

    const RenderClass = ({ item }) => (
        <TouchableOpacity
            className="bg-white rounded-lg p-4 mx-4 my-1 flex-row justify-between items-center"
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


            {loadingClasses ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="blue" />
                </View>
            ) : classes.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-red-500 font-bold text-xl">No Classes Yet..</Text>
                </View>
            ) : (
                <View>
                    <FlatList
                        data={classes}
                        keyExtractor={item => item.id}
                        renderItem={RenderClass}
                        className='mt-2 h-[92%]'
                    />

                </View>
            )}
            <TouchableOpacity className="w-30 h-15 absolute bottom-[10%] right-10 bg-blue-400 p-4 rounded-full " onPress={() => setModalVisible(true)}>
                <Ionicons name='add' size={20} color={'#fff'} />
            </TouchableOpacity>
        </View>
    );
};

export default Home;