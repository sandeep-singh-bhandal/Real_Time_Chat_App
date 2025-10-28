import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ChatPreferences = () => {
  const { user, axios } = useAppContext();
  const [chatPrefs, setChatPrefs] = useState(user.chatPreferences);

  const handleChatPrefSettings = async (updatedPrefs) => {
    try {
      const { data } = await axios.post(
        "/api/user/update-chat-preferences",
        updatedPrefs
      );
      if (data.success) {
        toast.success("Success");
      } else {
        toast.error(data.message || "Failed to update preferences");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const handleToggle = (key) => {
    const updatedPrefs = {
      ...chatPrefs,
      [key]: !chatPrefs[key],
    };
    setChatPrefs(updatedPrefs);
    handleChatPrefSettings(updatedPrefs);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900">
          Chat Preferences
        </h2>
        <p className="text-gray-500 mt-2">Customize your chat experience</p>
      </div>

      {/* Read Receipts Toggle */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Read Receipts
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Let others know when you've read their messages
          </p>
        </div>
        <button
          onClick={() => handleToggle("isReadReceiptEnabled")}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            chatPrefs.isReadReceiptEnabled ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              chatPrefs.isReadReceiptEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Notification Sound Toggle */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Notification Sound
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Play a sound for incoming messages
          </p>
        </div>
        <button
          onClick={() => handleToggle("isNotificationSoundEnabled")}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            chatPrefs.isNotificationSoundEnabled ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              chatPrefs.isNotificationSoundEnabled
                ? "translate-x-6"
                : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Typing Indicator Toggle */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Typing Indicator
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Show when you're typing a message
          </p>
        </div>
        <button
          onClick={() => handleToggle("isTypingIndicatorEnabled")}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            chatPrefs.isTypingIndicatorEnabled ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              chatPrefs.isTypingIndicatorEnabled
                ? "translate-x-6"
                : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default ChatPreferences;
