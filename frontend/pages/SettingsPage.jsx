import { useState } from "react";
import AccountSettings from "../components/AccountSettings";
import ChatPreferences from "../components/ChatPreferences";
import DeleteAccountSettingsPage from "../components/DeleteAccountSettingsPage";
import PrivacySettings from "../components/PrivacySettings";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");
  const sections = [
    { id: "account", title: "Account & Profile" },
    { id: "chat", title: "Chat Preferences" },
    { id: "privacy", title: "Privacy Settings" },
    { id: "delete", title: "Delete Account" },
  ];

  return (
    <div className="max-w-7xl mx-auto pt-14">
      <div className="flex gap-6 py-8 px-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg p-3 border border-gray-200 sticky top-20">
            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full cursor-pointer text-left px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    activeSection === section.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="max-w-2xl">
            {activeSection === "account" && <AccountSettings />}
            {activeSection === "chat" && <ChatPreferences />}
            {activeSection === "privacy" && <PrivacySettings />}
            {activeSection === "delete" && <DeleteAccountSettingsPage />}
          </div>
        </div>
      </div>
    </div>
  );
}
