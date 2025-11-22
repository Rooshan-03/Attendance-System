import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, FlatList, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { auth } from 'firebase.config';
import { getDatabase, ref, push, set, get, update, remove } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { Menu, Divider } from 'react-native-paper';

const Home = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [className, setClassName] = useState('');
    const [classes, setClasses] = useState([]);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingAddMore, setLoadingAddMore] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [updateClassName, setUpdateClassName] = useState('')
    const [updateModalVisible, setUpdateModalVisible] = useState(false)
    const db = getDatabase();

    const openItemMenu = (id) => setSelectedItemId(id)
    const closeItemMenu = () => setSelectedItemId(null)
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Classes",
            headerRight: () => (
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name='add' size={25} color={'#000'} />
                </TouchableOpacity>
            )
        });
    }, [navigation]);

    useEffect(() => {
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
    }, [classes])
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
    const updateClass = async () => {
        setUpdateModalVisible(true)
    }
    const deleteClass = async (classId) => {
        Alert.alert('Warning',
            'Are You sure you want to delete this Class?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'

                },
                {
                    text: 'Ok',
                    onPress: async () => {
                        const uid = auth.currentUser.uid
                        const deleteRef = ref(db, `Users/${uid}/Classes/${classId}`)
                        await remove(deleteRef)
                        setClasses(prev => prev.filter(c => c.id !== classId));
                    }
                }
            ]
        )

    }
    const RenderClass = ({ item, index }) => (

        <TouchableOpacity
            className="bg-white rounded-lg p-4 mx-4 my-1 flex-row justify-between items-center"
            onPress={() => navigation.navigate('ClassData', { className: item.className, classId: item.id })}
        >
            <View className="flex-row items-center">
                <Text className="font-bold text-slate-500">{index + 1}</Text>
                <Text className="text-base font-sans ml-2">{item.className}</Text>
            </View>

            <Menu
                visible={selectedItemId == item.id}
                onDismiss={closeItemMenu}
                anchor={
                    <TouchableOpacity onPress={() => openItemMenu(item.id)} style={{ paddingLeft: 10 }}>
                        <Ionicons name="ellipsis-vertical" size={18} color="grey" />
                    </TouchableOpacity>
                }
            >
                <Menu.Item title='Update' onPress={() => updateClass()} />
                <Menu.Item title='Delete' onPress={() => deleteClass(item.id)} />
            </Menu>
        </TouchableOpacity>





    );
    const handleUpdateSubmit = async () => {
        if (!updateClassName.trim()) {
            alert('Please Enter Class Name')
            return;
        }
        console.log(selectedItemId, updateClassName)
        const uid = auth.currentUser.uid
        console.log(selectedItemId)
        const updateRef = ref(db, `Users/${uid}/Classes/${selectedItemId}`)
        await update(updateRef, { className: updateClassName })
        setClasses(prev =>
            prev.map(c => c.id === selectedItemId ? { ...c, className: updateClassName } : c)
        )
        closeItemMenu()
        setUpdateModalVisible(false)
        setUpdateClassName('')
        setUpdateModalVisible(false)
    }
    return (
        <View className="flex-1">
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

            {/* Modal for updation of className */}
            <Modal
                animationType="slide"
                transparent
                visible={updateModalVisible}
                onRequestClose={() => setUpdateModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">

                    <View className='flex items-center justify-center p-6 m-3 bg-white w-[95%] rounded-lg '>
                        <Text className='font-sens font-bold m-3'>Edit Class Name</Text>

                        <TextInput
                            placeholder='Class Name to edit'
                            value={updateClassName}
                            onChangeText={setUpdateClassName}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 mb-3'
                        />
                        <View className='w-full'>
                            <TouchableOpacity className='w-full rounded-lg m-1 bg-green-500 flex items-center p-2 justify-center' onPress={handleUpdateSubmit} >
                                <Text className='text-white font-bold '>
                                    Update
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity className='w-full rounded-lg m-1 bg-slate-500 flex items-center p-2 justify-center' onPress={() => { setUpdateModalVisible(false), closeItemMenu }}>
                                <Text className='text-white font-bold'>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
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
                        renderItem={({ item, index }) => (
                            <RenderClass item={item} index={index} />
                        )} className='mt-2 h-[92%]'
                    />

                </View>
            )}

        </View>
    );
};

export default Home;