import { X } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useEffect, useState } from "react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, onlineUsers, socket, user } =
    useAppContext();
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!socket || !selectedUser?._id) return;

    const handleTyping = ({ fromUserId, toUserId, isTyping }) => {
      if (fromUserId === selectedUser._id && toUserId === user._id) {
        setIsTyping(isTyping);
      }
    };

    socket.on("typingListener", handleTyping);

    return () => {
      socket.off("typingListener", handleTyping);
    };
  }, [selectedUser]);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.name}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.name}</h3>
            <p className="text-sm text-base-content/70">
              {isTyping
                ? "typing..."
                : onlineUsers.includes(selectedUser._id)
                ? "Online"
                : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          className="cursor-pointer"
          onClick={() => setSelectedUser(null)}
        >
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
