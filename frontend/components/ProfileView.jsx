import { X, Phone, Clock, Mail } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

export function ProfileView() {
  const { setIsReceiverProfileOpen, selectedUser, onlineUsers, socket } =
    useAppContext();
  const [lastSeenTime, setLastSeenTime] = useState(null);

  useEffect(() => {
    if (!socket || !selectedUser?._id) return;
    socket.on("userDisconnected", ({ userId, lastSeen }) => {
      if (selectedUser._id === userId) {
        setLastSeenTime(lastSeen);
      }
    });
    return () => {
      socket.off("userDisconnected");
    };
  }, [socket, selectedUser]);

  return (
    <div className="flex flex-col flex-1">
      {/* Profile Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
        <button
          onClick={() => setIsReceiverProfileOpen(false)}
          className="rounded-full p-2 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Profile Header Section */}
        <div className="bg-gradient-to-b from-blue-50 to-white px-6 py-8 text-center border-b border-gray-200">
          <div className="mb-4 flex justify-center">
            <img
              src={selectedUser.profilePic || "avatar.png"}
              alt={selectedUser.name}
              className="w-32 h-32 rounded-full border-2 border-white shadow-lg object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {selectedUser.name}
          </h1>

          <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full border border-green-300">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-gray-600">
              {onlineUsers.includes(selectedUser._id)
                ? "Online"
                : `was online ${formatDistanceToNow(
                    lastSeenTime || selectedUser.lastSeen,
                    {
                      addSuffix: true,
                    }
                  )}`}
            </span>
          </div>
          <div className="mt-4 text-gray-600">
            Hey there! I am using Chatty!
          </div>
        </div>
        <div className="flex justify-center items-center">
          <h1>Media</h1>
        </div>
        {/* Information Section */}
        <div className="px-6 py-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Email
            </p>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">
                {selectedUser.email}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Phone
            </p>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <Phone className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">
                {selectedUser.phone}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Joined
            </p>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                {selectedUser.createdAt?.split("T")[0]}
              </p>
            </div>
          </div>

          <button className="bg-red-500 text-white py-2 rounded-lg mt-2 font-semibold cursor-pointer hover:bg-red-600 w-full">
            Block
          </button>
        </div>
      </div>
    </div>
  );
}
