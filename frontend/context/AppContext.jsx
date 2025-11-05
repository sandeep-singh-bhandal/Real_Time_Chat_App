import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

// axios setup
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true; // Enable cookies

let socket;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isReceiverProfileOpen, setIsReceiverProfileOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [sidebarUsers, setSidebarUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarUsersLoading, setIsSidebarUsersLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [showChangeEmailForm, setShowChangeEmailForm] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isNewMessageReceived, setIsNewMessageReceived] = useState(false);
  const [isOlderMessagesLoading, setIsOlderMessagesLoading] = useState(false);
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

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

  const getMessages = async (userId, pageToFetch) => {
    if (!hasMore || isMessagesLoading) return;

    const container = chatContainerRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;
    const prevScrollTop = container?.scrollTop || 0;

    pageToFetch === 1
      ? setIsMessagesLoading(true)
      : setIsOlderMessagesLoading(true);

    try {
      const { data } = await axios.get(
        `/api/message/${userId}?page=${pageToFetch}&limit=50`
      );

      const newMessages = data.messages;

      if (newMessages.length < 50) {
        setHasMore(false); // no more messages left
      }

      // Prepend old messages to current list
      setMessages((prev) => {
        if (prev.length && prev[0]?.receiverId?._id !== selectedUser._id) {
          return newMessages;
        }
        return pageToFetch === 1 ? newMessages : [...newMessages, ...prev];
      });

      // Maintain scroll position after older messages load
      if (pageToFetch > 1 && container) {
        const prevData = {
          scrollHeight: prevScrollHeight,
          scrollTop: prevScrollTop,
        };

        // Wait till DOM updates with new messages
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop =
            newScrollHeight - (prevData.scrollHeight - prevData.scrollTop);
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      pageToFetch === 1
        ? setIsMessagesLoading(false)
        : setIsOlderMessagesLoading(false);

      setHasMore(true);
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

  //Sending the message
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
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedUser) return;
    socket.on("newMessage", (newMsg) => {
      setIsNewMessageReceived(true);
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
    page,
    setPage,
    hasMore,
    setHasMore,
    setIsUpdatingProfile,
    isCheckingAuth,
    setIsCheckingAuth,
    isNewMessageReceived,
    setIsNewMessageReceived,
    isOlderMessagesLoading,
    chatContainerRef,
    checkAuth,
    showChangeEmailForm,
    setShowChangeEmailForm,
    showChangePasswordForm,
    setShowChangePasswordForm,
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
    showOtpForm,
    setShowOtpForm,
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
    showDeleteAccountModal,
    setShowDeleteAccountModal,
    socket,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
