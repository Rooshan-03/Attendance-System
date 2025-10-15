import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import AppIcon from '../assets/AppIcon.png';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from 'firebase.config';
import userLoggedInState from 'zustand/store';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false)
  // Zunstand Hook
  const { setUserState } = userLoggedInState()
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    loginUser(email, password)
  };
  const loginUser = async (email, password) => {
    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      Alert.alert('Succcess!', "Login Successfull")
      setLoading(false)
      setUserState();
      navigation.navigate('Home')
    } catch (error) {
      setLoading(false)
      let message = 'Login failed. Please check your credentials.';
      if (error.code === 'auth/invalid-email') message = 'Invalid email address.';
      if (error.code === 'auth/user-not-found') message = 'No user found with this email.';
      if (error.code === 'auth/wrong-password') message = 'Incorrect password.';
      Alert.alert('Error', message);
    }
  }
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f3f4f6' }}
    >
      <View className="bg-white p-6 rounded-xl shadow-md">
        {/* Center only the App Icon */}
        <View className="items-center mb-6">
          <Image
            source={AppIcon}
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
          />
        </View>

        <Text className="text-2xl font-bold mb-6 text-center">Login</Text>

        <Text className="text-gray-700 mb-1">Email</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 mb-4 w-full"
          placeholder="Enter your Gmail"
          keyboardType="email-address"
          autoCapitalize='none'
          value={email}
          onChangeText={setEmail}
        />

        <Text className="text-gray-700 mb-1">Password</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 mb-6 w-full"
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          className="bg-blue-500 rounded-lg p-3 w-full"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <Text className="text-white text-center font-bold">Loading...</Text>
          ) : (
            <Text className="text-white text-center font-bold">Login</Text>
          )}
        </TouchableOpacity>


        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <View className="items-end mt-4 w-full">
            <Text className="text-blue-400 text-right">Don't have an account? Signup</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Login;
