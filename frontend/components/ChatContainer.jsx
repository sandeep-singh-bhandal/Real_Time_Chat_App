import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { formatMessageTime } from "../lib/utils";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import toast from "react-hot-toast";
import DeleteModal from "./modals/DeleteMessageModal";
import MessageEditModal from "./modals/MessageEditModal";
import MessageInfoModal from "./modals/MessageInfoModal";
import ReactionInfoModal from "./modals/ReactionInfoModal";
import EmojiPicker from "emoji-picker-react";
import {
  Check,
  CheckCheck,
  Reply,
  Copy,
  Edit,
  Trash,
  Info,
  EllipsisVertical,
  Ban,
  SmilePlus,
} from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/react";

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
    axios,
    page,
    setPage,
    hasMore,
    setHasMore,
    chatContainerRef,
    isNewMessageReceived,
    setIsNewMessageReceived,
  } = useAppContext();

  const messageEndRef = useRef(null);
  const prevMessagesLength = useRef(messages.length);
  const [newText, setNewText] = useState();
  const [msgToBeDeleted, setMsgToBeDeleted] = useState();
  const [replyMessage, setReplyMessage] = useState(null);
  const [showMessageEditingModal, setShowMessageEditingModal] = useState(false);
  const [showMessageDeleteModal, setShowMessageDeleteModal] = useState(false);
  const [reactedMessage, setReactedMessage] = useState(null);
  const [messageInfo, setMessageInfo] = useState(null);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState(null);

  // Message Reacting Handler
  const handleAddReaction = async (messageId, emoji) => {
    try {
      setShowEmojiPickerFor(null);
      await axios.post(`api/message/react-message/${messageId}`, { emoji });
    } catch (error) {
      toast.error("Failed to add reaction");
    }
  };

  // Fetch messages on scroll
  const handleScroll = (e) => {
    const container = e.target;
    const { scrollTop } = container;
    // If user scrolled to top -> fetch older messages
    if (scrollTop === 0 && hasMore && !isMessagesLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      getMessages(selectedUser._id, nextPage);
    }
  };

  // Fetch initial messages & subscribe
  useEffect(() => {
    if (!selectedUser?._id || !user?._id) return;
    setPage(1);
    setHasMore(true);
    getMessages(selectedUser._id, 1);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, user]);


  // Scroll to bottom on initial loading
  useEffect(() => {
    if (!isMessagesLoading && messages.length > 0) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isMessagesLoading, selectedUser?._id]);

  // Scroll to last message when messages update
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    // Scroll to bottom only if user is already near bottom
    if (isNewMessageReceived) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    setIsNewMessageReceived(false);
  }, [isNewMessageReceived]);

  // Sockets
  useEffect(() => {
    if (!socket) return;
    socket.on("markMessageRead", ({ chattingWithUserId, readBy }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.receiverId._id === chattingWithUserId
            ? { ...msg, isRead: true, readBy }
            : msg
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
            ? { ...msg, isDeleted: true, isEditted: false, reactions: [] }
            : msg
        )
      );
    });
    socket.on("messageReaction", (message) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === message._id ? message : msg))
      );
    });

    return () => {
      socket.off("markMessageRead");
      socket.off("messageEditted");
      socket.off("messageDeleted");
      socket.off("messageReaction");
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
      {/* <EmojiPicker/> */}

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-scroll scrollbar-hide p-4 space-y-4"
        onScroll={handleScroll}
      >
        {user?._id &&
          messages?.map((message, index) => (
            <div
              key={index}
              className={`chat ${
                (message.senderId._id || message.senderId) === user?._id
                  ? "chat-end"
                  : "chat-start"
              }`}
              ref={index === messages.length - 1 ? messageEndRef : null}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      (message.senderId._id || message.senderId) === user?._id
                        ? user?.profilePic || "/avatar.png"
                        : selectedUser.privacySettings.profilePictureVisibility
                        ? selectedUser?.profilePic
                          ? selectedUser?.profilePic
                          : "/avatar.png"
                        : "/avatar.png"
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
                  (message.senderId._id || message.senderId) === user._id &&
                  "flex-row-reverse"
                }`}
              >
                <div
                  className={`${
                    message?.imageData?.url
                      ? "bg-transparent"
                      : (message.senderId._id || message.senderId) === user._id
                      ? "bg-[#0093e9] text-white"
                      : "bg-gray-300 text-black"
                  } chat-bubble break-all whitespace-pre-wrap min-w-16 max-w-96 relative`}
                >
                  {/* Show Reactions */}
                  {message.reactions?.length > 0 && (
                    <div
                      onClick={() => setReactedMessage(message)}
                      className="flex border border-gray-400 absolute -bottom-4.5 right-1 bg-white/90 rounded-full px-0.5 cursor-pointer"
                    >
                      {message.reactions.map((reaction, i) => (
                        <span key={i} className="text-md">
                          {reaction.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Chat Bubble For Images */}
                  {message?.imageData?.url ? (
                    message.isDeleted ? (
                      <span
                        className={`${
                          (message.senderId._id || message.senderId) ===
                          user._id
                            ? "bg-[#0093e9] text-white"
                            : "bg-gray-300 text-black"
                        } chat-bubble max-w-96 ${
                          message.isDeleted
                            ? (message.senderId._id || message.senderId) ===
                              user._id
                              ? "italic text-zinc-200"
                              : "italic text-zinc-800"
                            : ""
                        }`}
                      >
                        <span className="flex justify-center items-center gap-1 w-max">
                          <Ban className="size-3.5 mt-0.5" />{" "}
                          {(message.senderId._id || message.senderId) ===
                          user._id
                            ? "You deleted this image"
                            : "This image was deleted"}
                        </span>
                      </span>
                    ) : (
                      <img
                        src={message.imageData.url}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md mb-2"
                      />
                    )
                  ) : null}

                  {/* Chat Bubble For Reply Message  */}
                  {message.replyTo && !message.isDeleted && (
                    <div
                      className={`mb-2 px-3 py-2 rounded-md text-sm border-l-4 ${
                        (message.senderId._id || message.senderId) === user._id
                          ? "bg-blue-100 border-blue-300"
                          : "bg-gray-200 border-gray-400"
                      }`}
                    >
                      <p
                        className={`font-semibold mb-0.5 ${
                          (message.senderId._id || message.senderId) ===
                          user._id
                            ? "text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        {message.replyTo.senderId._id === user._id
                          ? "You"
                          : message.replyTo.senderId?.name}
                      </p>

                      {message.replyTo.imageData?.url ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={message.replyTo.imageData.url}
                            alt="Replied"
                            className="w-50 h-auto rounded-md object-cover border opacity-80"
                          />
                          {message.replyTo.text && (
                            <p className="line-clamp-1 text-gray-700 text-sm">
                              {message.replyTo.text}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-700 text-sm line-clamp-2 break-words whitespace-pre-wrap">
                          {message.replyTo.text ||
                            message.repliedText ||
                            "Media message"}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Chat Bubble For Normal Text */}
                  {message.text && (
                    <p
                      className={`${
                        (message.senderId._id || message.senderId) === user._id
                          ? "mr-5"
                          : ""
                      }
                      ${message.replyTo && !message.isDeleted && "mr-25"} ${
                        message.isDeleted
                          ? (message.senderId._id || message.senderId) ===
                            user._id
                            ? "italic text-zinc-200"
                            : "italic text-zinc-800"
                          : ""
                      } ${
                        message.isEditted
                          ? (message.senderId._id || message.senderId) ===
                            user._id
                            ? "mr-13"
                            : "mr-7"
                          : ""
                      } break-all whitespace-pre-wrap overflow-hidden`}
                    >
                      {message.isDeleted ? (
                        <span className="flex justify-center items-center gap-1 w-max">
                          <Ban className="size-3.5 mt-0.5" />{" "}
                          {(message.senderId._id || message.senderId) ===
                          user._id
                            ? "You deleted this message"
                            : "This message was deleted"}
                        </span>
                      ) : (
                        String(message.text)
                      )}
                    </p>
                  )}

                  {/* Message Edited Flag  */}
                  {message.isEditted && !message.isDeleted && (
                    <span
                      className={`text-[11px] absolute bottom-1 mr-4 ${
                        (message.senderId._id || message.senderId) === user._id
                          ? "text-gray-300 right-3"
                          : "text-gray-500 -right-2"
                      } italic`}
                    >
                      Edited
                    </span>
                  )}

                  {/* Message Seen Status  */}

                  {(message.senderId._id || message.senderId) === user._id &&
                    !message.isDeleted &&
                    (message.isRead ? (
                      <CheckCheck
                        className={`${
                          !selectedUser.chatPreferences.isReadReceiptEnabled &&
                          "hidden"
                        } h-4 w-4 absolute right-1.5 bottom-1.5`}
                      />
                    ) : (
                      <Check
                        className={`${
                          !selectedUser.chatPreferences.isReadReceiptEnabled &&
                          "hidden"
                        }  h-4 w-4 absolute right-1.5 bottom-1.5`}
                      />
                    ))}
                </div>

                {/* DropDown Chat Manipulation Options  */}
                {!message.isDeleted && (
                  <Dropdown>
                    <DropdownTrigger className="active:outline-none focus:outline-none">
                      <EllipsisVertical className="size-4 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 my-auto" />
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Static Actions" className="group">
                      <DropdownSection showDivider>
                        <DropdownItem
                          key="reply"
                          onClick={() => setReplyMessage(message)}
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
                      {(message.senderId._id || message.senderId) ===
                        user._id && (
                        <DropdownSection showDivider>
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
                          <DropdownItem
                            key="info"
                            className="text-primary"
                            color="primary"
                            startContent={<Info className="size-5" />}
                            onClick={() => setMessageInfo(message)}
                          >
                            Info
                          </DropdownItem>
                        </DropdownSection>
                      )}

                      <DropdownItem
                        key="emojis"
                        startContent={<SmilePlus className="size-5" />}
                        onClick={() =>
                          setShowEmojiPickerFor(
                            showEmojiPickerFor === message._id
                              ? null
                              : message._id
                          )
                        }
                      >
                        Add Reaction
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                )}
                {showEmojiPickerFor === message._id && (
                  <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20"
                    onClick={() => setShowEmojiPickerFor(null)}
                  >
                    <div
                      className="relative"
                      onClick={(e) => e.stopPropagation()} // prevent backdrop click
                    >
                      <EmojiPicker
                        skinTonesDisabled
                        height={400}
                        width={350}
                        onEmojiClick={(emojiData) => {
                          handleAddReaction(message._id, emojiData.emoji);
                          setShowEmojiPickerFor(null);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Edit Message Modal */}
      {showMessageEditingModal && (
        <MessageEditModal
          setShowMessageEditingModal={setShowMessageEditingModal}
          newText={newText}
          setNewText={setNewText}
        />
      )}

      {/* Delete Message Modal */}
      {showMessageDeleteModal && (
        <DeleteModal
          setShowMessageDeleteModal={setShowMessageDeleteModal}
          msgToBeDeleted={msgToBeDeleted}
        />
      )}

      {/* View Message Info Modal */}
      {messageInfo && (
        <MessageInfoModal
          messageInfo={messageInfo}
          setMessageInfo={setMessageInfo}
        />
      )}

      {/* Reaction Info Modal */}
      {reactedMessage && (
        <ReactionInfoModal
          reactedMessage={reactedMessage}
          setReactedMessage={setReactedMessage}
        />
      )}

      {/* Input box for sending message  */}
      <MessageInput
        replyMessage={replyMessage}
        setReplyMessage={setReplyMessage}
      />
    </div>
  );
};

export default ChatContainer;
