import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const PrivacySettings = () => {
  const { axios, user } = useAppContext();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [privacySettings, setPrivacySettings] = useState(
    user?.privacySettings || {
      lastSeenVisibility: true,
      onlineStatusVisibility: true,
      profilePictureVisibility: true,
      bioVisibility: true,
    }
  );

  const getBlockedUsers = async () => {
    try {
      const { data } = await axios.get("/api/user/get-blocked-users");
      setBlockedUsers(data.blockedUsers || []);
    } catch (error) {
      toast.error("Failed to fetch blocked users");
    }
  };

  useEffect(() => {
    getBlockedUsers();
  }, []);

  // Handle toggle updates
  const handleToggle = async (key) => {
    const updatedSettings = {
      ...privacySettings,
      [key]: !privacySettings[key],
    };
    setPrivacySettings(updatedSettings);

    try {
      const { data } = await axios.post(
        "/api/user/update-privacy-settings",
        updatedSettings
      );
      if (data.success) toast.success("Success");
      else toast.error(data.message || "Failed to update settings");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  // Handle unblock user
  const handleUnblock = async (id) => {
    try {
      const { data } = await axios.post(`/api/user/unblock/${id}`);
      if (data.success) {
        setBlockedUsers((prev) => prev.filter((u) => u._id !== id));
        toast.success("User unblocked");
      } else {
        toast.error(data.message || "Failed to unblock");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

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

      {/* Last Seen */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Last Seen</h3>
          <p className="text-sm text-gray-500 mt-1">
            Let others see when you were last active
          </p>
        </div>
        <button
          onClick={() => handleToggle("lastSeenVisibility")}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            privacySettings.lastSeenVisibility ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              privacySettings.lastSeenVisibility
                ? "translate-x-6"
                : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Online Status */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Online Status
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Show when you’re currently online
          </p>
        </div>
        <button
          onClick={() => handleToggle("onlineStatusVisibility")}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            privacySettings.onlineStatusVisibility
              ? "bg-blue-600"
              : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              privacySettings.onlineStatusVisibility
                ? "translate-x-6"
                : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Profile Picture */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Profile Picture
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Show your profile photo to others
          </p>
        </div>
        <button
          onClick={() => handleToggle("profilePictureVisibility")}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            privacySettings.profilePictureVisibility
              ? "bg-blue-600"
              : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              privacySettings.profilePictureVisibility
                ? "translate-x-6"
                : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Bio Visibility */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Bio</h3>
          <p className="text-sm text-gray-500 mt-1">
            Allow others to view your bio
          </p>
        </div>
        <button
          onClick={() => handleToggle("bioVisibility")}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            privacySettings.bioVisibility ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              privacySettings.bioVisibility ? "translate-x-6" : "translate-x-1"
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
            {blockedUsers.map((usr) => (
              <div
                key={usr._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700 text-sm">{usr.name}</span>
                <button
                  onClick={() => handleUnblock(usr._id)}
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
