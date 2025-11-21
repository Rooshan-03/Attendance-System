import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import AppIcon from '../assets/AppIcon.jpeg';
import { auth } from '../firebase.config';
import { getDatabase, ref, set } from 'firebase/database';

// Add the eye icons (using react-native-vector-icons or expo vector icons)
import Icon from 'react-native-vector-icons/Ionicons';

const Signup = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // New states for password visibility
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
      let message = "Something Went Wrong";
      if (error.code === 'auth/invalid-email') message = 'Invalid email address.';
      if (error.code === 'auth/user-not-found') message = 'No user found with this email.';
      if (error.code === 'auth/wrong-password') message = 'Incorrect password.';
      if (error.code === 'auth/email-already-in-use') message = 'User with this Email already Registered'
      Alert.alert('Error', message);
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
          autoCapitalize='none'
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

        {/* Password with eye icon */}
        <Text className="text-gray-700 mb-1">Password</Text>
        <View className="border border-gray-300 rounded-lg mb-4 flex-row items-center">
          <TextInput
            className="flex-1 p-3"
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="px-3"
          >
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="grey"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password with eye icon */}
        <Text className="text-gray-700 mb-1">Confirm Password</Text>
        <View className="border border-gray-300 rounded-lg mb-6 flex-row items-center">
          <TextInput
            className="flex-1 p-3"
            placeholder="Confirm password"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            className="px-3"
          >
            <Icon
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={24}
              color="grey"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-blue-500 rounded-lg p-3"
          onPress={handleSignup}
        >
          {loading ? (<ActivityIndicator size='small' color='#192130' />) : (
            <Text className="text-white text-center font-bold">Sign Up</Text>)}

        </TouchableOpacity>
        <TouchableOpacity onPress={() => { navigation.navigate('Login') }}>
          <View className="items-end mt-4">
            <Text className="text-blue-400">Already Have an Account? Login</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Signup;