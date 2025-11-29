import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useUserLoggedInState = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      setUserState: (value) => set({ isLoggedIn: value }), 
      checkUserState: () => get().isLoggedIn,
    }),
    {
      name: 'user-login-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useUserLoggedInState;
