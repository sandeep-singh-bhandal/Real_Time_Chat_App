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
  Ban,
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
  const prevMessagesLength = useRef(messages.length);
  const [newText, setNewText] = useState();
  const [msgToBeDeleted, setMsgToBeDeleted] = useState();
  const [showMessageEditingModal, setShowMessageEditingModal] = useState(false);
  const [showMessageDeleteModal, setShowMessageDeleteModal] = useState(false);

  // Message Editing Handler
  const handleEditText = async (e) => {
    e.preventDefault();
    const { data } = await axios.patch("/api/message/edit-message", {
      messageId: newText._id,
      editedMessageText: newText.text,
    });
    data.success
      ? setShowMessageEditingModal(false)
      : toast.error(data.message);
  };

  // Message Deleting Handler
  const handleDeleteMessage = async (e) => {
    const { data } = await axios.delete(
      `/api/message/delete-message/${msgToBeDeleted._id}`
    );
    data.success
      ? (toast.success(data.message), setShowMessageDeleteModal(false))
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
    if (messages.length > prevMessagesLength.current) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  // Sockets
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
    socket.on("messageEditted", ({ messageId, newText }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, text: newText, isEditted: true }
            : msg
        )
      );
    });
    socket.on("messageDeleted", ({ deletedMessageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === deletedMessageId
            ? { ...msg, isDeleted: true, isEditted: false }
            : msg
        )
      );
    });

    return () => {
      socket.off("markMessageRead");
      socket.off("newMessage");
      socket.off("messageEditted");
      socket.off("messageDeleted");
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

      <div className="flex-1 overflow-y-scroll scrollbar-hide p-4 space-y-4">
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
                className={`group relative flex items-start gap-1 ${
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
                  } chat-bubble break-all whitespace-pre-wrap max-w-96`}
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
                        message.senderId === user._id ? "mr-5" : ""
                      } ${
                        message.isDeleted
                          ? message.senderId === user._id
                            ? "italic text-zinc-200"
                            : "italic text-zinc-800"
                          : ""
                      } ${
                        message.isEditted
                          ? message.senderId === user._id
                            ? "mr-13"
                            : "mr-7"
                          : ""
                      } break-all whitespace-pre-wrap overflow-hidden`}
                    >
                      {message.isDeleted ? (
                        <span className="flex justify-center items-center gap-1 w-max">
                          <Ban className="size-3.5 mt-0.5" />{" "}
                          {message.senderId === user._id
                            ? "You deleted this message"
                            : "This message was deleted"}
                        </span>
                      ) : (
                        String(message.text)
                      )}
                    </p>
                  )}

                  {message.isEditted && !message.isDeleted && (
                    <span
                      className={`text-[11px] absolute bottom-1 mr-4 ${
                        message.senderId === user._id
                          ? "text-gray-300 right-3"
                          : "text-gray-500 -right-2"
                      } italic`}
                    >
                      Edited
                    </span>
                  )}

                  {message.senderId === user._id &&
                    (message.isRead ? (
                      <CheckCheck className="h-4 w-4 absolute right-1.5 bottom-1.5" />
                    ) : (
                      <Check className="h-4 w-4 absolute right-1.5 bottom-1.5" />
                    ))}
                </div>

                {!message.isDeleted && (
                  <Dropdown>
                    <DropdownTrigger className="active:outline-none focus:outline-none">
                      <EllipsisVertical className="size-4 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 my-auto" />
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
                          onClick={() => {
                            navigator.clipboard.writeText(message.text);
                            toast.success("Text Copied");
                          }}
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
                              setShowMessageEditingModal(true);
                              setNewText(message);
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
                            onClick={() => {
                              setShowMessageDeleteModal(true);
                              setMsgToBeDeleted(message);
                            }}
                          >
                            Delete
                          </DropdownItem>
                        )}
                      </DropdownSection>
                      {message.senderId === user._id && (
                        <DropdownItem
                          key="info"
                          className="text-primary"
                          color="primary"
                          startContent={<Info className="size-5" />}
                        >
                          Info
                        </DropdownItem>
                      )}
                      <DropdownItem
                        key="emojis"
                        startContent={<Delete className="size-5" />}
                      >
                        Emojies
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Edit Message Modal */}
      {showMessageEditingModal && (
        <div
          onClick={() => setShowMessageEditingModal(false)}
          className="absolute top-0 backdrop-blur-xs left-0 w-full h-full flex items-center justify-center z-50"
        >
          <div
            className="flex flex-col bg-white shadow-md rounded-xl py-6 px-5 md:w-[370px] w-[300px] border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-lg text-left">Edit Text</h1>
            <form
              onSubmit={handleEditText}
              id="editTextForm"
              className="flex flex-col justify-center gap-4 mt-3 w-full"
            >
              <textarea
                ref={(el) => {
                  if (el) {
                    el.style.height = "auto";
                    el.style.height = el.scrollHeight + "px";
                  }
                }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                name="editText"
                className="border border-gray-400 w-full rounded-md px-3 py-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                autoFocus
                value={newText.text || ""}
                onChange={(e) =>
                  setNewText({
                    ...newText,
                    text: e.target.value,
                  })
                }
                placeholder="Edit your message..."
              />
              <div className="flex gap-7 justify-between">
                <button
                  type="button"
                  className="w-full md:w-36 h-10 rounded-md border border-gray-300 bg-white text-gray-600 font-medium text-sm hover:bg-gray-100 active:scale-95 transition cursor-pointer"
                  onClick={() => setShowMessageEditingModal(false)}
                >
                  Cancel
                </button>
                <button
                  form="editTextForm"
                  type="submit"
                  disabled={newText.text.length === 0}
                  className="w-full md:w-36 h-10 rounded-md text-white bg-blue-600 font-medium text-sm hover:bg-blue-700 active:scale-95 transition cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Message Modal */}
      {showMessageDeleteModal && (
        <div
          onClick={() => setShowMessageDeleteModal(false)}
          className="absolute top-0 backdrop-blur-xs left-0 w-full h-full flex items-center justify-center z-50"
        >
          <div
            className="flex flex-col items-center bg-white shadow-md rounded-xl py-6 px-5 md:w-[460px] w-[370px] border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center p-4 bg-red-100 rounded-full">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.875 5.75h1.917m0 0h15.333m-15.333 0v13.417a1.917 1.917 0 0 0 1.916 1.916h9.584a1.917 1.917 0 0 0 1.916-1.916V5.75m-10.541 0V3.833a1.917 1.917 0 0 1 1.916-1.916h3.834a1.917 1.917 0 0 1 1.916 1.916V5.75m-5.75 4.792v5.75m3.834-5.75v5.75"
                  stroke="#DC2626"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-gray-900 font-semibold mt-4 text-xl">
              Delete Message?
            </h2>
            <p className="mt-1">
              This will delete the message for {selectedUser.name} too
            </p>
            <div className="flex items-center justify-center gap-4 mt-5 w-full">
              <button
                type="button"
                className="w-full md:w-36 h-10 rounded-md border border-gray-300 bg-white text-gray-600 font-medium text-sm hover:bg-gray-100 active:scale-95 transition cursor-pointer"
                onClick={() => setShowMessageDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMessage}
                className="w-full md:w-36 h-10 rounded-md text-white bg-red-600 font-medium text-sm hover:bg-red-700 active:scale-95 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
