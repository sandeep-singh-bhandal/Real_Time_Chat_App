import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import OtpForm from "./OtpForm";
import { useAppContext } from "../../context/AppContext";
import ChangeEmailForm from "./ChangeEmailForm";
import ChangePasswordForm from "./ChangePasswordForm";

const AccountSettings = () => {
  const [loading, setLoading] = useState(false);
  const {
    user,
    setUser,
    axios,
    showOtpForm,
    setShowOtpForm,
    showChangeEmailForm,
    setShowChangeEmailForm,
    showChangePasswordForm,
    setShowChangePasswordForm,
    navigate,
    disconnectToSocket,
  } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout");
      if (data.success) {
        toast.success(data.message);
        navigate("/signup");
        setUser(null);
        disconnectToSocket();
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };
  const handleRequestCode = async () => {
    try {
      setLoading(true);

      const promise = axios.post("/api/user/request-code", {
        email: user.email,
      });

      await toast.promise(promise, {
        loading: "Sending OTP...",
        success: "OTP sent to your email",
        error: "Failed to send OTP",
      });

      setShowOtpForm(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
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
        <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900">
          {user?.email}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              user?.isEmailVerified
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            {user?.isEmailVerified ? "Email verified" : "Email not verified"}
          </span>
        </div>
        <div className="flex gap-3">
          {!user?.isEmailVerified && (
            <button
              disabled={loading}
              onClick={handleRequestCode}
              className={`${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } mt-4 cursor-pointer px-4 py-2  text-white rounded-lg  text-sm font-medium`}
            >
              {loading ? (
                <Loader2 className="animate-spin size-5" />
              ) : (
                "Verify Email"
              )}
            </button>
          )}
          <button
            onClick={() => setShowChangeEmailForm(true)}
            className={`${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            } mt-4 cursor-pointer px-4 py-2  text-white rounded-lg  text-sm font-medium`}
          >
            Change Email
          </button>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Password</h3>
        <p className="text-sm text-gray-500 mb-4">
          Change your password regularly for security
        </p>
        <button
          onClick={() => setShowChangePasswordForm(true)}
          className="px-4 cursor-pointer py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 text-sm font-medium hover:text-white transition-all duration-400"
        >
          Change Password
        </button>
      </div>
      <button
        onClick={logout}
        className="bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 text-white w-full cursor-pointer py-3 rounded-lg  text-sm font-medium"
      >
        Log out
      </button>
      {showOtpForm && (
        <div
          onClick={() => setShowOtpForm(false)}
          className="w-full h-full backdrop-blur-sm fixed inset-0 flex justify-center items-center"
        >
          <OtpForm emailToBeVerified={user?.email} />
        </div>
      )}
      {showChangeEmailForm && (
        <div
          onClick={() => setShowChangeEmailForm(false)}
          className="w-full h-full backdrop-blur-sm fixed inset-0 flex justify-center items-center"
        >
          <ChangeEmailForm />
        </div>
      )}
      {showChangePasswordForm && (
        <div
          onClick={() => setShowChangePasswordForm(false)}
          className="w-full h-full backdrop-blur-sm fixed inset-0 flex justify-center items-center"
        >
          <ChangePasswordForm />
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
