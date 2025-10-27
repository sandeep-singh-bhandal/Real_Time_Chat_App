import { useState } from "react";

const ChatPreferences = () => {
    const [chatPrefs, setChatPrefs] = useState({
        theme: "light",
        fontSize: "medium",
        readReceipts: true,
        typingIndicator: true,
      });
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900">
          Chat Preferences
        </h2>
        <p className="text-gray-500 mt-2">Customize your chat experience</p>
      </div>

      {/* Theme Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Theme</h3>
        <div className="space-y-3">
          {["light", "dark", "auto"].map((theme) => (
            <label
              key={theme}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="radio"
                name="theme"
                value={theme}
                checked={chatPrefs.theme === theme}
                onChange={(e) =>
                  setChatPrefs({ ...chatPrefs, theme: e.target.value })
                }
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700 capitalize text-sm">
                {theme === "auto" ? "Auto (System)" : theme}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Font Size Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Font Size
        </h3>
        <div className="space-y-3">
          {["small", "medium", "large"].map((size) => (
            <label
              key={size}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="radio"
                name="fontSize"
                value={size}
                checked={chatPrefs.fontSize === size}
                onChange={(e) =>
                  setChatPrefs({ ...chatPrefs, fontSize: e.target.value })
                }
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700 capitalize text-sm">{size}</span>
            </label>
          ))}
        </div>
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
          onClick={() =>
            setChatPrefs({
              ...chatPrefs,
              readReceipts: !chatPrefs.readReceipts,
            })
          }
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            chatPrefs.readReceipts ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              chatPrefs.readReceipts ? "translate-x-6" : "translate-x-1"
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
          onClick={() =>
            setChatPrefs({
              ...chatPrefs,
              typingIndicator: !chatPrefs.typingIndicator,
            })
          }
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            chatPrefs.typingIndicator ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              chatPrefs.typingIndicator ? "translate-x-6" : "translate-x-1"
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
          onClick={() =>
            setChatPrefs({
              ...chatPrefs,
              typingIndicator: !chatPrefs.typingIndicator,
            })
          }
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            chatPrefs.typingIndicator ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              chatPrefs.typingIndicator ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  )
}

export default ChatPreferences
