import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true;
let socket;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [messages, setMessages] = useState(true);
  const [sidebarUsers, setSidebarUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarUsersLoading, setIsSidebarUsersLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/user/check-auth");
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.log(error);
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const getSidebarUsers = async () => {
    setIsSidebarUsersLoading(true);
    try {
      const { data } = await axios.get("/api/message/user");
      setSidebarUsers(data.users);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSidebarUsersLoading(false);
    }
  };

  const getMessages = async (userId) => {
    setIsMessagesLoading(true);
    try {
      const { data } = await axios.get(`/api/message/${userId}`);
      setMessages(data.messages);
    } catch (error) {
      console.log(error);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const connectToSocket = () => {
    if (!user || socket?.connected) {
      return;
    }
    socket = io(import.meta.env.VITE_BACKEND_URL);
    socket.connect();
  };

  const disconnectToSocket = () => {
    if (socket?.connected) socket.disconnect();
  };

  useEffect(() => {
    if (user) {
      connectToSocket();
    }
  }, [user]);

  const value = {
    axios,
    navigate,
    user,
    setUser,
    isUpdatingProfile,
    setIsUpdatingProfile,
    isCheckingAuth,
    setIsCheckingAuth,
    checkAuth,
    getSidebarUsers,
    getMessages,
    messages,
    setMessages,
    sidebarUsers,
    setSidebarUsers,
    selectedUser,
    setSelectedUser,
    isSidebarUsersLoading,
    setIsSidebarUsersLoading,
    isMessagesLoading,
    setIsMessagesLoading,
    connectToSocket,
    disconnectToSocket,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
