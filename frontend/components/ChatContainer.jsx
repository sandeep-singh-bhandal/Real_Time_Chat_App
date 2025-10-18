import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { useAppContext } from "../context/AppContext";
import {
  Check,
  CheckCheck,
  Reply,
  Copy,
  Edit,
  Trash,
  Pin,
  Info,
  Delete,
  EllipsisVertical,
} from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/react";
import toast from "react-hot-toast";

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
    axios,
  } = useAppContext();

  const messageEndRef = useRef(null);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [newText, setNewText] = useState("");

  const handleEditText = async (e) => {
    e.preventDefault();
    const { data } = await axios.patch("/api/message/edit-message", {
      messageId: newText._id,
      editedMessageText: newText.text,
    });
    data.success
      ? (setIsEditingMessage(false))
      : toast.error(data.message);
  };

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
    <div className="flex-1 flex flex-col overflow-auto relative">
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
                className={`group relative flex items-center gap-1 ${
                  message.senderId === user._id && "flex-row-reverse"
                }`}
              >
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
                      className={`${
                        message.senderId === user._id ? "mr-3" : ""
                      }`}
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
                <Dropdown>
                  <DropdownTrigger className="active:outline-none focus:outline-none">
                    <EllipsisVertical className="size-4 cursor-pointer opacity-0 group-hover:opacity-100  transition-opacity duration-300 " />
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Static Actions" className="group">
                    <DropdownSection showDivider>
                      <DropdownItem
                        key="reply"
                        startContent={<Reply className="size-5" />}
                      >
                        Reply
                      </DropdownItem>
                      <DropdownItem
                        key="copy"
                        startContent={<Copy className="size-5" />}
                      >
                        Copy
                      </DropdownItem>
                    </DropdownSection>
                    <DropdownSection showDivider>
                      {message.senderId === user._id && (
                        <DropdownItem
                          key="edit"
                          startContent={<Edit className="size-5" />}
                          onClick={() => {
                            setIsEditingMessage(true), setNewText(message);
                          }}
                        >
                          Edit
                        </DropdownItem>
                      )}
                      <DropdownItem
                        key="pin"
                        startContent={<Pin className="size-5" />}
                      >
                        Pin
                      </DropdownItem>
                      {message.senderId === user._id && (
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Trash className="size-5" />}
                        >
                          Delete file
                        </DropdownItem>
                      )}
                    </DropdownSection>
                    <DropdownItem
                      key="info"
                      className="text-primary"
                      color="primary"
                      startContent={<Info className="size-5" />}
                    >
                      Info
                    </DropdownItem>
                    <DropdownItem
                      key="emojis"
                      startContent={<Delete className="size-5" />}
                    >
                      Emojies
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          ))}
      </div>

      {/* Edit message dialog box */}
      {isEditingMessage && (
        <div className="absolute top-0 backdrop-blur-xs left-0 w-full h-full flex items-center justify-center z-50">
          <div className="flex flex-col bg-white shadow-md rounded-xl py-6 px-5 md:w-[370px] w-[300px] border border-gray-200">
            <h1 className="text-lg text-left">Edit Text</h1>
            <form
              onSubmit={handleEditText}
              id="editTextForm"
              className="flex flex-col justify-center gap-4 mt-3 w-full"
            >
              <input
                type="text"
                name="editText"
                className="border border-gray-400 w-full rounded-md h-10 px-3"
                autoFocus
                value={newText.text || ""}
                onChange={(e) =>
                  setNewText({
                    ...newText,
                    text: e.target.value,
                  })
                }
              />
              <div className="flex gap-7 justify-between">
                <button
                  type="button"
                  className="w-full md:w-36 h-10 rounded-md border border-gray-300 bg-white text-gray-600 font-medium text-sm hover:bg-gray-100 active:scale-95 transition cursor-pointer"
                  onClick={() => setIsEditingMessage(false)}
                >
                  Cancel
                </button>
                <button
                  form="editTextForm"
                  type="submit"
                  className="w-full md:w-36 h-10 rounded-md text-white bg-blue-600 font-medium text-sm hover:bg-blue-700 active:scale-95 transition cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
