import { X,Clock, Mail } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { formatDate, formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function ProfileView() {
  const {
    setIsReceiverProfileOpen,
    selectedUser,
    onlineUsers,
    socket,
    messages,
    axios,
    user,
  } = useAppContext();
  const [lastSeenTime, setLastSeenTime] = useState(null);
  const [isUserBlocked, setIsUserBlocked] = useState(
    user.blockedUsers.includes(selectedUser?._id)
  );

  const medias = messages.filter((message) => {
    return message.imageData.url;
  });

  const handleBlockUnblock = async (action) => {
    const { data } = await axios.post(`api/user/${action}/${selectedUser._id}`);
    data.success
      ? (toast.success(data.message),
        setIsUserBlocked(action === "block" ? true : false))
      : toast.error(data.message);
  };

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
          <div className="mt-4 text-gray-600">{selectedUser.bio}</div>
        </div>
        {medias.length > 0 && (
          <div className="flex flex-col gap-4 mt-4 mb-8">
            <h1 className="text-center text-2xl text-gray-900 font-semibold">
              Media
            </h1>
            <div className="flex gap-4 mx-4 rounded-lg bg-white p-5">
              {medias
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((media, index) => (
                  <div key={index}>
                    <img
                      src={media.imageData.url}
                      alt=""
                      className="object-cover h-auto w-32 aspect-square rounded-md"
                    />
                    <div className="mt-1 text-center">
                      {formatDate(media.createdAt, "dd MMM, yyyy")}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
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
              Joined
            </p>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                {selectedUser.createdAt?.split("T")[0]}
              </p>
            </div>
          </div>

          <button
            onClick={(e) =>
              handleBlockUnblock(e.target.innerText.toLowerCase())
            }
            className={`${
              isUserBlocked
                ? "bg-gray-500 hover:bg-gray-600"
                : "bg-red-500 hover:bg-red-600"
            } text-white py-2 rounded-lg mt-2 font-semibold cursor-pointer w-full`}
          >
            {isUserBlocked ? "Unblock" : "Block"}
          </button>
        </div>
      </div>
    </div>
  );
}
