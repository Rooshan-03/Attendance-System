import create from 'zustand'
export default useLoggedInState = create((set)=>({
    isLoggedIn : false,
    setUserState :()=> set((state)=>({isLoggedIn: !state.isLoggedIn})),
    checkUSerState :()=> get().isLoggedIn,
}))