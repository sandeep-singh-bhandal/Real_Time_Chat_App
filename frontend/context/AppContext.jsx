import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true;
let socket;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [messages, setMessages] = useState([]);
  const [sidebarUsers, setSidebarUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarUsersLoading, setIsSidebarUsersLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
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
      setSidebarUsers(data);
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

  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/message/send/${selectedUser._id}`,
        messageData
      );
      setMessages((prev) => [...prev, data.newMessage]);
    } catch (error) {
      toast.error(error);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedUser) return;
    socket.off("newMessage"); // remove old listener
    socket.on("newMessage", (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });
  };

  const unsubscribeFromMessages = () => {
    socket.off("newMessage");
  };

  const connectToSocket = () => {
    if (!user?._id || socket?.connected) return;

    socket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { userId: user._id },
      autoConnect: true,
    });

    socket.off("getOnlineUsers");
    socket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
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
    sendMessage,
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
    onlineUsers,
    setOnlineUsers,
    subscribeToMessages,
    unsubscribeFromMessages,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
