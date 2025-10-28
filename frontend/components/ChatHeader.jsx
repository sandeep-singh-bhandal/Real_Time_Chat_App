import { X } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

const ChatHeader = () => {
  const {
    selectedUser,
    setSelectedUser,
    onlineUsers,
    socket,
    user,
    setIsReceiverProfileOpen,
  } = useAppContext();

  const [isTyping, setIsTyping] = useState(false);
  const [lastSeenTime, setLastSeenTime] = useState(null);

  useEffect(() => {
    if (!socket || !selectedUser?._id) return;

    const handleTyping = ({ fromUserId, toUserId, isTyping }) => {
      if (
        fromUserId === selectedUser._id &&
        toUserId === user._id &&
        selectedUser.chatPreferences?.isTypingIndicatorEnabled
      ) {
        setIsTyping(isTyping);
      }
    };

    const handleUserDisconnect = ({ userId, lastSeen }) => {
      if (selectedUser._id === userId) {
        setLastSeenTime(lastSeen);
      }
    };

    socket.on("typingListener", handleTyping);
    socket.on("userDisconnected", handleUserDisconnect);

    return () => {
      socket.off("typingListener", handleTyping);
      socket.off("userDisconnected", handleUserDisconnect);
    };
  }, [selectedUser, socket]);

  // Helper: get status text based on privacy
  const getStatusText = () => {
    const privacy = selectedUser?.privacySettings || {};
    const isOnline = onlineUsers.includes(selectedUser._id);

    // Typing status (only if allowed)
    if (isTyping && selectedUser.chatPreferences?.isTypingIndicatorEnabled) {
      return "typing...";
    }

    // Online status (respect privacy)
    if (isOnline) {
      return privacy.onlineStatusVisibility ? "Online" : "";
    }

    // Last seen (respect privacy)
    if (!isOnline && privacy.lastSeenVisibility) {
      const time = lastSeenTime || selectedUser.lastSeen;
      if (time) {
        return `was online ${formatDistanceToNow(new Date(time), {
          addSuffix: true,
        })}`;
      }
    }

    return ""; // Hide if privacy disabled
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setIsReceiverProfileOpen(true)}
        >
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={
                  selectedUser.privacySettings.profilePictureVisibility
                    ? selectedUser.profilePic
                      ? selectedUser.profilePic
                      : "/avatar.png"
                    : "/avatar.png"
                }
                alt={selectedUser.name}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.name}</h3>
            <p
              className={`text-sm text-base-content/70 truncate ${
                isTyping ? "text-blue-500" : ""
              }`}
            >
              {getStatusText() || ""}
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
