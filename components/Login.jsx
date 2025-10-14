import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import AppIcon from '../assets/AppIcon.png'; // adjust path if necessary

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // Add your login logic here (API call, Firebase, etc.)
    Alert.alert('Success', 'Login successful!');
  };

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
  >
    <Text className="text-white text-center font-bold">Login</Text>
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
