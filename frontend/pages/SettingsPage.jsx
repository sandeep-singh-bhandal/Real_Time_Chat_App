import { useState } from "react";
import AccountSettings from "../components/settings/AccountSettings";
import ChatPreferences from "../components/settings/ChatPreferences";
import PrivacySettings from "../components/settings/PrivacySettings";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");

  const sections = [
    { id: "account", title: "Account & Profile" },
    { id: "chat", title: "Chat Preferences" },
    { id: "privacy", title: "Privacy Settings" },
  ];

  return (
    <div className="max-w-7xl mx-auto pt-14 max-sm:pt-8 max-sm:px-0 px-4">
      <div className="flex flex-col sm:flex-row gap-6 py-8">
        {/* Sidebar (List view on mobile) */}
        <div
          className={`${
            activeSection ? "hidden sm:block" : "block"
          } w-full sm:w-64 flex-shrink-0`}
        >
          <div className="bg-white rounded-xl max-sm:rounded-none p-3 border border-gray-200 sm:sticky sm:top-20 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 sm:mb-2 text-gray-800">
              Settings
            </h2>

            <div className="flex flex-col gap-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`cursor-pointer w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-800 hover:bg-gray-100 active:bg-gray-200"
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div
          className={`flex-1 min-w-0 ${
            activeSection ? "block" : "hidden sm:block"
          }`}
        >
          <div className="max-w-2xl bg-white rounded-xl max-sm:rounded-none border border-gray-200 p-4 sm:p-6 shadow-sm relative">
            {/* Back button for mobile */}
            <button
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-2 text-gray-600 mb-4 sm:hidden hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>

            {activeSection === "account" && <AccountSettings />}
            {activeSection === "chat" && <ChatPreferences />}
            {activeSection === "privacy" && <PrivacySettings />}

            {!activeSection && (
              <p className="text-gray-500 text-sm sm:hidden">
                Select a setting to view details
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
