import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { useAppContext } from "../context/AppContext";
import { Check, CheckCheck } from "lucide-react";

const ChatContainer = () => {
  const {
    user,
    messages,
    setMessages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    socket,
    markAsRead,
    getEverySideBarUserLatestMsg,
  } = useAppContext();

  const messageEndRef = useRef(null);

  // Fetch messages & subscribe
  useEffect(() => {
    if (!selectedUser?._id || !user?._id) return;
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, user]);

  // Scroll to last message when messages update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    socket.on("newMessage", () => getEverySideBarUserLatestMsg());
    socket.on("markMessageRead", (chattingWithUserId) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.receiverId === chattingWithUserId ? { ...msg, isRead: true } : msg
        )
      );
    });
    return () => {
      socket.off("markMessageRead"), socket.off("newMessage");
    };
  }, [socket]);

  useEffect(() => {
    markAsRead(selectedUser._id);
  }, [messages.length]);

  if (isMessagesLoading || !user?._id) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {user?._id &&
          messages?.map((message, index) => (
            <div
              key={index}
              className={`chat ${
                message.senderId === user?._id ? "chat-end" : "chat-start"
              }`}
              ref={index === messages.length - 1 ? messageEndRef : null}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === user?._id
                        ? user?.profilePic || "/avatar.png"
                        : selectedUser?.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div
                className={`${
                  message.imageData.url
                    ? "bg-transparent"
                    : message.senderId === user._id
                    ? "bg-[#0093e9] text-white"
                    : "bg-gray-300 text-black"
                } chat-bubble flex flex-col `}
              >
                {message.imageData.url && (
                  <img
                    src={message.imageData.url}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && (
                  <p
                    className={`${message.senderId === user._id ? "mr-3" : ""}`}
                  >
                    {" "}
                    {String(message.text)}
                  </p>
                )}
                {message.senderId === user._id &&
                  (message.isRead ? (
                    <CheckCheck className="h-4 w-4 absolute right-1.5 bottom-1.5" />
                  ) : (
                    <Check className="h-4 w-4 absolute right-1.5 bottom-1.5" />
                  ))}
              </div>
            </div>
          ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
