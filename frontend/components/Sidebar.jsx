import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
  const {
    getSidebarUsers,
    sidebarUsers,
    setSidebarUsers,
    selectedUser,
    setSelectedUser,
    isSidebarUsersLoading,
    onlineUsers,
    getLatestMessage,
    socket,
    unreadMessages,
    setUnreadMessages,
    getUnreadMessages,
    markAsRead,
  } = useAppContext();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [sidebarUsersLatestMessages, setSidebarUsersLatestMessages] = useState(
    {}
  );

  // Function to show latest message preview of each user in the sidebar
  const getEverySideBarUserLatestMsg = async () => {
    const data = await Promise.all(
      sidebarUsers.map(async (user) => {
        const latestMsgData = await getLatestMessage(user?._id);
        const latestMsg = latestMsgData?.latestMessage?.[0];
        return {
          ...user,
          latestMsgText: latestMsg?.text || "",
          latestMsgTime: latestMsg?.createdAt || null,
        };
      })
    );

    // sort users by latestMsgTime (newest first)
    const sorted = [...data].sort((a, b) => {
      if (!a.latestMsgTime && !b.latestMsgTime) return 0;
      if (!a.latestMsgTime) return 1;
      if (!b.latestMsgTime) return -1;
      return new Date(b.latestMsgTime) - new Date(a.latestMsgTime);
    });

    setSidebarUsersLatestMessages(
      sorted.reduce((acc, user) => {
        acc[user._id] = user.latestMsgText;
        return acc;
      }, {})
    );
    setSidebarUsers(sorted);
  };

  useEffect(() => {
    getSidebarUsers();
    getUnreadMessages();
  }, []);

  useEffect(() => {
    if (sidebarUsers.length > 0) {
      getEverySideBarUserLatestMsg();
    }
  }, [sidebarUsers.length]);

  // Real time message preview in sidebar
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      const senderId = message.senderId;

      setUnreadMessages((prev) => ({
        ...prev,
        [senderId]:
          selectedUser?._id === senderId ? 0 : (prev[senderId] || 0) + 1,
      }));

      setSidebarUsersLatestMessages((prev) => ({
        ...prev,
        [senderId]: message.text,
      }));
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage); // cleanup
    };
  }, [socket, selectedUser]);

  // Handling Showing only online users or not
  const filteredUsers = showOnlineOnly
    ? sidebarUsers
        .filter((user) => onlineUsers.includes(user._id))
        .sort((a, b) => {
          const timeA = new Date(a.latestMsgTime || 0);
          const timeB = new Date(b.latestMsgTime || 0);
          return timeB - timeA;
        })
    : sidebarUsers.sort((a, b) => {
        const timeA = new Date(a.latestMsgTime || 0);
        const timeB = new Date(b.latestMsgTime || 0);
        return timeB - timeA;
      });

  if (isSidebarUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* TODO: Online filter toggle */}
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

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers?.map((user) => (
          <button
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
              setUnreadMessages((prev) => ({ ...prev, [user._id]: 0 }));
              markAsRead(user._id);
            }}
            className={`
                    w-full p-3 flex items-center gap-3
                    hover:bg-base-300 transition-colors cursor-pointer
                    ${
                      selectedUser?._id === user._id
                        ? "bg-base-300 ring-1 ring-base-300"
                        : ""
                    }
                `}
          >
            {/* Profile image wrapper */}
            <div className="relative flex-shrink-0 w-12 h-12">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover object-center"
              />
              {/* Green online dot */}
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 
          rounded-full ring-2 ring-white"
                />
              )}
            </div>

            {/* Text section */}
            <div className="hidden lg:flex flex-col text-left min-w-0 flex-1">
              <div className="font-medium truncate">{user.name}</div>
              <div className="text-sm text-zinc-400 truncate">
                {sidebarUsersLatestMessages[user._id] ||
                  (onlineUsers.includes(user._id) ? "Online" : "Offline")}
              </div>
            </div>
            {unreadMessages[user._id] > 0 && (
              <span className="ml-auto p-1 px-2 rounded-full text-xs bg-green-500 text-white">
                {unreadMessages[user._id]}
              </span>
            )}
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
