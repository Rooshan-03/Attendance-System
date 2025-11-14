import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import AppIcon from '../assets/AppIcon.jpeg';
import { auth } from '../firebase.config';
import { getDatabase, ref, set } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons'; 

const Signup = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    setLoading(true)
    if (!name || !email || !number || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      setLoading(false)
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      setLoading(false)
      return;
    }
    createNewUser(email, password);
  };
  const createNewUser = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user)
        setLoading(false)
        const data = {
          name,
          email,
          number
        };
        await storeDataInFirebase(data)
      }
    } catch (error) {
      console.log(error)
      Alert.alert('SignUp Error', error.message)
      setLoading(false)
    }
  }
  const storeDataInFirebase = async (data) => {
    try {
      const db = getDatabase()
      const uid = auth.currentUser.uid
      await set(ref(db, `Users/${uid}`), data)
      setLoading(false)
      setConfirmPassword('')
      setEmail('')
      setName('')
      setNumber('')
      setPassword('')
      Alert.alert('Verify Email', "PLease Verify Your email to proceed")
      navigation.navigate('Login')
    } catch (error) {
      console.log('Error: ', error.message)
      Alert.alert('Error')
      setLoading(false)
    }
  }
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f3f4f6' }}
    >
      <View className="bg-white p-6 rounded-xl shadow-md">
        <View className="items-center mb-6">
          <Image
            source={AppIcon}
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
          />
        </View>

        <Text className="text-2xl font-bold mb-6 text-center">Sign Up</Text>

        {/* Name, Email, Phone Inputs remain same */}

        {/* Password */}
        <Text className="text-gray-700 mb-1">Password</Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg p-3 mb-4">
          <TextInput
            className="flex-1"
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <Text className="text-gray-700 mb-1">Confirm Password</Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg p-3 mb-6">
          <TextInput
            className="flex-1"
            placeholder="Confirm password"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          className="bg-blue-500 rounded-lg p-3"
          onPress={handleSignup}
        >
          {loading ? (
            <ActivityIndicator size='small' color='#192130' />
          ) : (
            <Text className="text-white text-center font-bold">Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <View className="items-end mt-4">
            <Text className="text-blue-400">Already Have an Account? Login</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Signup;
