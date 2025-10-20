import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
  const {
    getSidebarUsers,
    sidebarUsers,
    selectedUser,
    setSelectedUser,
    isSidebarUsersLoading,
    onlineUsers,
    socket,
    unreadMessages,
    setUnreadMessages,
    getUnreadMessages,
    markAsRead,
    setIsReceiverProfileOpen,
  } = useAppContext();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [sortedUsers, setSortedUsers] = useState([]);

  // initial data fetch
  useEffect(() => {
    getSidebarUsers();
    getUnreadMessages();
  }, []);

  // set initial sorting
  useEffect(() => {
    setSortedUsers(sidebarUsers);
  }, [sidebarUsers]);

  // Handle new message -> move sender to top + unread count
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      const senderId = message.senderId;

      // unread count update
      setUnreadMessages((prev) => ({
        ...prev,
        [senderId]:
          selectedUser?._id === senderId ? 0 : (prev[senderId] || 0) + 1,
      }));

      // move that sender user to top
      setSortedUsers((prev) => {
        const found = prev.find((u) => u._id === senderId);
        if (!found) return prev;
        const remaining = prev.filter((u) => u._id !== senderId);
        return [found, ...remaining];
      });
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser]);

  // filter logic (online only toggle)
  const filteredUsers = showOnlineOnly
    ? sortedUsers.filter((user) => onlineUsers.includes(user._id))
    : sortedUsers;

  if (isSidebarUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      {/* User List */}
      <div className="overflow-y-auto w-full py-3 [&::-webkit-scrollbar]:hidden scrollbar-none">
        {filteredUsers?.map((user) => (
          <button
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
              setUnreadMessages((prev) => ({ ...prev, [user._id]: 0 }));
              markAsRead(user._id);
              setIsReceiverProfileOpen(false);
            }}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors cursor-pointer ${
              selectedUser?._id === user._id
                ? "bg-base-300 ring-1 ring-base-300"
                : ""
            }`}
          >
            {/* Profile Pic */}
            <div className="relative flex-shrink-0 w-12 h-12">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {/* Green dot if online */}
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full ring-2 ring-white" />
              )}
            </div>

            {/* Name + Status */}
            <div className="hidden lg:flex flex-col text-left min-w-0 flex-1">
              <div className="font-medium truncate">{user.name}</div>
              <div className="text-sm text-gray-500">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>

            {/* Unread badge */}
            {unreadMessages[user._id] > 0 && (
              <span className="ml-auto p-1 px-2 rounded-full text-xs bg-blue-500 text-white">
                {unreadMessages[user._id]}
              </span>
            )}
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No users</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
