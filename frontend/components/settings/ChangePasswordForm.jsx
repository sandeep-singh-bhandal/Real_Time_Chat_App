import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { newPasswordSchema } from "../../validation/newPassword";
import { Eye, EyeClosed, Lock } from "lucide-react";
import toast from "react-hot-toast";

const ChangePasswordForm = () => {
  const { axios, setShowChangePasswordForm } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [signUpError, setSignUpError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordReset = async (e) => {
    try {
      e.preventDefault();
      if (!formData.currentPassword)
        return toast.error("Please enter your current password");
      if (!formData.newPassword)
        return toast.error("Please set a new password");
      newPasswordSchema.parse({
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword,
      });
      setLoading(true);
      const { data } = await axios.post("/api/user/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword,
      });
      data.success
        ? (toast.success(data.message), setShowChangePasswordForm(false))
        : toast.error(data.message);
    } catch (error) {
      setSignUpError(JSON.parse(error));
    }
    setLoading(false);
  };

  return (
    <form
      onClick={(e) => e.stopPropagation()}
      onSubmit={handlePasswordReset}
      className="max-w-96 space-y-2 w-full border border-gray-300/60 rounded-2xl px-8 bg-white"
    >
      <h1 className="text-gray-900 text-center text-2xl mt-10 font-medium">
        Create a new password
      </h1>
      <span className="float-left mt-4">Current Password</span>
      <div className="border-gray-300/80 relative flex items-center mt-4 w-full bg-white border-2  h-12 overflow-hidden pl-2 rounded-lg gap-2">
        <Lock className="h-5 w-5" />
        <input
          type={showCurrentPassword ? "text" : "password"}
          value={formData.currentPassword}
          name="currentPassword"
          placeholder="Enter your current password"
          autoComplete="off"
          className="bg-transparent text-gray-500 placeholder-gray-500 outline-none text-sm w-full h-full"
          onChange={(e) => {
            handleChange(e);
            setSignUpError("");
          }}
        />
        <button
          type="button"
          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          className="cursor-pointer absolute right-3 my-auto scale-125"
        >
          {showCurrentPassword ? (
            <Eye className="size-4" />
          ) : (
            <EyeClosed className="size-4" />
          )}
        </button>
      </div>

      {typeof signUpError === "string" &&
      signUpError.toLowerCase().includes("new password") ? (
        <span className="text-red-500 float-left mt-4">{signUpError}</span>
      ) : Array.isArray(signUpError) &&
        signUpError[0].path.includes("newPassword") ? (
        <span className="text-red-500 float-left mt-4">
          {signUpError[0].message}
        </span>
      ) : typeof signUpError === "string" &&
        signUpError.toLowerCase().includes("incorrect") ? (
        <span className="float-left mt-4">New Password</span>
      ) : (
        <span className="float-left mt-4">New Password</span>
      )}
      <div
        className={`${
          signUpError && signUpError[0].path[0] === "newPassword"
            ? "border-red-500"
            : "border-gray-300/80"
        } relative flex items-center mt-4 w-full bg-white border-2  h-12 overflow-hidden pl-2 rounded-lg gap-2`}
      >
        <Lock className="h-5 w-5" />
        <input
          type={showNewPassword ? "text" : "password"}
          value={formData.newPassword}
          name="newPassword"
          placeholder="Set a New Password"
          autoComplete="off"
          className="bg-transparent text-gray-500 placeholder-gray-500 outline-none text-sm w-full h-full"
          onChange={(e) => {
            handleChange(e);
            setSignUpError("");
          }}
        />
        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="cursor-pointer absolute right-3 my-auto scale-125"
        >
          {showNewPassword ? (
            <Eye className="size-4" />
          ) : (
            <EyeClosed className="size-4" />
          )}
        </button>
      </div>
      {Array.isArray(signUpError) &&
      signUpError[0].path.includes("confirmNewPassword") ? (
        <span className="text-red-500 float-left mt-4">
          {signUpError[0].message}
        </span>
      ) : typeof signUpError === "string" &&
        signUpError.toLowerCase().includes("incorrect") ? (
        <span className="float-left mt-4">Confirm New Password</span>
      ) : (
        <span className="float-left mt-4">Confirm New Password</span>
      )}
      <div
        className={`${
          signUpError && signUpError[0].path[0] === "confirmNewPassword"
            ? "border-red-500"
            : "border-gray-300/80"
        }
             relative flex items-center mt-4 w-full bg-white border-2 border-gray-300/80  h-12 overflow-hidden pl-2 rounded-lg gap-2`}
      >
        <Lock className="h-5 w-5" />
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmNewPassword}
          placeholder="Confirm your New Password"
          autoComplete="off"
          className="bg-transparent text-gray-500 placeholder-gray-500 outline-none text-sm w-full h-full"
          name="confirmNewPassword"
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="cursor-pointer absolute right-3 my-auto scale-125"
        >
          {showConfirmPassword ? (
            <Eye className="size-4" />
          ) : (
            <EyeClosed className="size-4" />
          )}
        </button>
      </div>

      <button
        type="submit"
        // disabled={loading ? true : false}
        className={`${
          loading ? "bg-gray-300" : "bg-primary hover:bg-primary-dull"
        }  flex justify-center items-center gap-1 mt-5 mb-11 w-full h-11 rounded-full text-white  cursor-pointer transition-opacity`}
      >
        {loading ? "Please wait" : "Continue"}
        {loading && (
          <div
            className="animate-spin inline-block size-4 border-3 border-current border-t-transparent text-white rounded-full dark:text-white"
            role="status"
            aria-label="loading"
          ></div>
        )}
      </button>
    </form>
  );
};

export default ChangePasswordForm;
