import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const PrivacySettings = () => {
  const { axios } = useAppContext();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [privacyPrefs, setPrivacyPrefs] = useState({
    lastSeen: true,
    onlineStatus: true,
  });
  const getBlockedUsers = async () => {
    try {
      const { data } = await axios.get("/api/user/get-blocked-users");
      setBlockedUsers(data.blockedUsers);
    } catch (error) {
      toast.error("Failed to fetch blocked users");
    }
  };
  useEffect(() => {
    getBlockedUsers();
  }, [blockedUsers.length]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900">
          Privacy Settings
        </h2>
        <p className="text-gray-500 mt-2">
          Control who can see your information
        </p>
      </div>

      {/* Last Seen Toggle */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Last Seen Status
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Let others see when you were last active
          </p>
        </div>
        <button
          onClick={() =>
            setPrivacyPrefs({
              ...privacyPrefs,
              lastSeen: !privacyPrefs.lastSeen,
            })
          }
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            privacyPrefs.lastSeen ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              privacyPrefs.lastSeen ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Online Status Toggle */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Online Status
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Show when you're currently online
          </p>
        </div>
        <button
          onClick={() =>
            setPrivacyPrefs({
              ...privacyPrefs,
              onlineStatus: !privacyPrefs.onlineStatus,
            })
          }
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            privacyPrefs.onlineStatus ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              privacyPrefs.onlineStatus ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Show Profile Pic */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Profile Photo
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Show your profile picture to others
          </p>
        </div>
        <button
          onClick={() =>
            setPrivacyPrefs({
              ...privacyPrefs,
              onlineStatus: !privacyPrefs.onlineStatus,
            })
          }
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            privacyPrefs.onlineStatus ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              privacyPrefs.onlineStatus ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      {/* Show Bio To Others */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Bio Visibility
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Allow others to view your bio
          </p>
        </div>
        <button
          onClick={() =>
            setPrivacyPrefs({
              ...privacyPrefs,
              onlineStatus: !privacyPrefs.onlineStatus,
            })
          }
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            privacyPrefs.onlineStatus ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              privacyPrefs.onlineStatus ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Blocked Users */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Blocked Users
        </h3>
        {blockedUsers.length > 0 ? (
          <div className="space-y-2">
            {blockedUsers?.map((user, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700 text-sm">{user.name}</span>
                <button
                  onClick={() =>
                    setPrivacyPrefs({
                      ...privacyPrefs,
                      blockedUsers: privacyPrefs.blockedUsers.filter(
                        (_, i) => i !== idx
                      ),
                    })
                  }
                  className="text-red-600 hover:text-red-700 font-semibold text-sm cursor-pointer"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No blocked users</p>
        )}
      </div>
    </div>
  );
};

export default PrivacySettings;
