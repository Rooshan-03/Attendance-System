import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView , Image} from 'react-native';
import AppIcon from '../assets/AppIcon.png';
const Signup = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    if (!name || !email || !number || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    Alert.alert('Success', 'Signup successful!');
    // Add your API call or Firebase signup logic here
  };

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

        <Text className="text-gray-700 mb-1">Name</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 mb-4"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />

        <Text className="text-gray-700 mb-1">Email</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 mb-4"
          placeholder="Enter your Gmail"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text className="text-gray-700 mb-1">Phone Number</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 mb-4"
          placeholder="Enter your number"
          keyboardType="phone-pad"
          value={number}
          onChangeText={setNumber}
        />

        <Text className="text-gray-700 mb-1">Password</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 mb-4"
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text className="text-gray-700 mb-1">Confirm Password</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 mb-6"
          placeholder="Confirm password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          className="bg-blue-500 rounded-lg p-3"
          onPress={handleSignup}
        >
          <Text className="text-white text-center font-bold">Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() =>{navigation.navigate('Login')}}>
          <View className="items-end mt-4">
            <Text className="text-blue-400">Already Have an Account? Login</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Signup;
