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
  const [theme, setTheme] = useState("corporate");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isReceiverProfileOpen, setIsReceiverProfileOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sidebarUsers, setSidebarUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarUsersLoading, setIsSidebarUsersLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});

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

  // Function to get user's all unread messages
  const getUnreadMessages = async () => {
    const { data } = await axios.get("/api/message/get-unread-messages");
    setUnreadMessages(data.unreadMessages?.unreadCounts);
  };

  // Marking the messages as read
  const markAsRead = async (chattingWithUserId) => {
    await axios.patch(`/api/message/mark-as-read/${chattingWithUserId}`);
  };

  const sendMessage = async (messageData) => {
    try {
      const formData = new FormData();
      formData.append("text", messageData.text);
      formData.append("image", messageData.image);
      formData.append("replyTo", JSON.stringify(messageData.replyTo));
      const { data } = await axios.post(
        `/api/message/send/${selectedUser._id}`,
        formData
      );
      setMessages((prev) => [...prev, data.newMessage]);
    } catch (error) {
      toast.error(error);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedUser) return;
    socket.on("newMessage", (newMsg) => {
      if (newMsg.senderId._id !== selectedUser._id) return;
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
    unreadMessages,
    setUnreadMessages,
    getUnreadMessages,
    markAsRead,
    sendMessage,
    isReceiverProfileOpen,
    setIsReceiverProfileOpen,
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
    theme,
    setTheme,
    socket,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
