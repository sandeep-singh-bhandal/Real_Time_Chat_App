import { useState } from "react";
import { useAppContext } from "../context/AppContext";

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    email: "user@example.com",
    phone: "+1 (555) 123-4567",
    emailVerified: true,
  });
  const { user } = useAppContext();
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900">
          Account & Profile
        </h2>
        <p className="text-gray-500 mt-2">
          Manage your account information and security
        </p>
      </div>

      {/* Email Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Email Address
        </h3>
        <input
          type="email"
          value={user?.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              formData.emailVerified
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            {formData.emailVerified ? "Email verified" : "Email not verified"}
          </span>
        </div>
        {!formData.emailVerified && (
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Verify your email
          </button>
        )}
      </div>

      {/* Phone Section */}
      {user?.phone && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Phone Number
          </h3>
          <input
            type="tel"
            value={user?.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>
      )}

      {/* Password Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Password</h3>
        <p className="text-sm text-gray-500 mb-4">
          Change your password regularly for security
        </p>
        <button className="px-4 cursor-pointer py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 text-sm font-medium hover:text-white transition-all duration-400">
          Change Password
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
