import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { auth } from 'firebase.config';
import { getDatabase, ref, push, set, onValue } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

const Home = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [className, setClassName] = useState('');
    const [classes, setClasses] = useState([]);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingAddMore, setLoadingAddMore] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(true);

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const db = getDatabase();
        const classesRef = ref(db, `Users/${uid}/Classes`);

        const unsubscribe = onValue(classesRef, (snapshot) => {
            if (snapshot.exists()) {
                const classesArray = Object.entries(snapshot.val()).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));
                setClasses(classesArray);
            } else {
                setClasses([]);
            }
            setLoadingClasses(false);
        }, (error) => {
            console.log("Error fetching classes:", error);
            setLoadingClasses(false);
        });

        return () => unsubscribe();
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


            {loadingClasses ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="blue" />
                </View>
            ) : (
                <View>
                    <FlatList
                        data={classes}
                        keyExtractor={item => item.id}
                        renderItem={RenderClass}
                        contentContainerStyle={classes.length === 0 ? { flex: 1 } : {paddingBottom:40}}
                        ListEmptyComponent={
                            <View className="flex-1 justify-center items-center">
                                <Text className="text-red-500 font-bold text-xl">No Classes Yet..</Text>
                            </View>
                        }
                    />
                    <TouchableOpacity className="w-30 h-15 absolute bottom-20 right-10 bg-blue-500 p-4 rounded-lg shadow-lg" onPress={() => setModalVisible(true)}>
                        <View className='flex justify-center items-center flex-row'>
                            <Ionicons name='add' size={15} color={'#fff'} />
                            <Text className='text-sm ml-2 text-white font-bold'>Add </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default Home;