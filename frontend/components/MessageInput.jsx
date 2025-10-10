import { useRef, useState } from "react";
import { Image, Send, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState();
  const { sendMessage, socket, selectedUser, user } = useAppContext();
  const fileInputRef = useRef();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;

    try {
      await sendMessage({
        text: text.trim(),
        image,
      });

      // Clear form
      setText("");
      setImage();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const typingTimeout = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (!socket || !selectedUser) return;

    socket.emit("typing", {
      fromUserId: user._id,
      toUserId: selectedUser._id,
      isTyping: true,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typing", {
        fromUserId: user._id,
        toUserId: selectedUser._id,
        isTyping: false,
      });
    }, 1000);
  };

  return (
    <div className="p-4 w-full">
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
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center cursor-pointer"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered focus:outline-none rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={handleChange}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => setImage(e.target.files[0])}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${image ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-circle bg-green-500 text-white"
          disabled={!text.trim() && !image}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
