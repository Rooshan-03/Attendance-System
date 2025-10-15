import { create } from 'zustand';

const userLoggedInState = create((set, get) => ({
  isLoggedIn: false,
  setUserState: () => set((state) => ({ isLoggedIn: !state.isLoggedIn })),
  checkUserState: () => get().isLoggedIn,
}));

export default userLoggedInState;