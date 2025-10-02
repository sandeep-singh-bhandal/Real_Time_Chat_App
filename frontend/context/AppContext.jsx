import { createContext, useContext, useState } from "react";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/user/check-auth");
      setUser(data.user);
    } catch (error) {
      console.log(error);
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const signUp = async (data) => {};

  const value = {
    axios,
    user,
    setUser,
    isLoggingIn,
    setIsLoggingIn,
    isSigningIn,
    setIsSigningIn,
    isUpdatingProfile,
    setIsUpdatingProfile,
    isCheckingAuth,
    setIsCheckingAuth,
    checkAuth,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
