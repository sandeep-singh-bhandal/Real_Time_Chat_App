import { useRef, useState } from "react";
import { Image, Send, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useEffect } from "react";

const MessageInput = ({ replyMessage, setReplyMessage }) => {
  const { sendMessage, socket, selectedUser, user, messages, setSidebarUsers } =
    useAppContext();
  const [text, setText] = useState("");
  const [image, setImage] = useState();
  const fileInputRef = useRef();
  const typingTimeout = useRef(null);
  const textareaRef = useRef();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    try {
      await sendMessage({
        text: text.trim(),
        image,
        replyTo: replyMessage,
      });

      // Clear input & image & reply
      setText("");
      setImage();
      setReplyMessage(null);
      if (textareaRef.current) textareaRef.current.style.height = "40px";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    // Auto-grow textarea height
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;

    if (!socket || !selectedUser) return;
    socket.emit("typingTrigger", {
      fromUserId: user._id,
      toUserId: selectedUser._id,
      isTyping: true,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typingTrigger", {
        fromUserId: user._id,
        toUserId: selectedUser._id,
        isTyping: false,
      });
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("userBlocked", ({ blockedByUserId, blockedUserId }) => {
      setSidebarUsers((prev) =>
        prev.map((u) =>
          u._id === blockedByUserId
            ? { ...u, blockedUsers: [...u.blockedUsers, blockedUserId] }
            : u
        )
      );
    });

    socket.on("userUnblocked", ({ unBlockedByUserId, unBlockedUserId }) => {
      setSidebarUsers((prev) =>
        prev.map((u) =>
          u._id === unBlockedByUserId
            ? {
                ...u,
                blockedUsers: u.blockedUsers.filter(
                  (id) => id !== unBlockedUserId
                ),
              }
            : u
        )
      );
    });
    return () => {
      socket.off("userBlocked");
      socket.off("userUnblocked");
    };
  }, [socket]);

  return (
    <div className="p-4 w-full">
      {/* Image Preview */}
      {image && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={() => setImage()}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center cursor-pointer"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input + Send */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-end gap-2 w-full"
      >
        <div className="flex-1 flex items-end gap-2">
          <div className="w-full">
            {/* Reply Preview */}
            {replyMessage && (
              <div className="flex items-start justify-between bg-gray-200/20 border border-l-4 border-gray-300   border-l-blue-500 rounded-tl-md rounded-tr-md p-2">
                <div className="flex-1">
                  <p className="text-xs text-blue-400 font-medium mb-0.5">
                    Replying to{" "}
                    {messages.find((el) => el._id === replyMessage._id)
                      ?.senderName ||
                      messages.find((el) => el._id === replyMessage._id)
                        ?.senderId.name ||
                      (replyMessage.senderId === user?._id && user?.name) ||
                      "User"}
                  </p>
                  {replyMessage.text && (
                    <p className="text-sm text-gray-600 truncate">
                      {replyMessage.text.length > 100
                        ? replyMessage.text.slice(0, 100) + "..."
                        : replyMessage.text}
                    </p>
                  )}
                  {replyMessage.imageData?.url && (
                    <img
                      src={replyMessage.imageData.url}
                      alt="reply"
                      className="w-16 h-16 object-cover rounded-md mt-1 border border-zinc-700"
                    />
                  )}
                </div>
                <button
                  onClick={() => setReplyMessage(null)}
                  className="ml-2 p-1 rounded-full hover:bg-zinc-200 text-zinc-800 cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              rows={1}
              className={`w-full min-h-[40px] max-h-[200px] border border-gray-300 ${
                replyMessage && "rounded-tl-none rounded-tr-none border-t-0"
              } rounded-md px-3 py-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm sm:text-base`}
              placeholder="Type a message..."
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              image ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-circle bg-blue-500 text-white"
          disabled={!text.trim() && !image}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
