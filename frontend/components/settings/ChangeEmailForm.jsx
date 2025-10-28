import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { z } from "zod";

const ChangeEmailForm = () => {
  const emailSchema = z.email().toLowerCase();
  const { axios, setShowChangeEmailForm, setUser } = useAppContext();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailChange = async () => {
    if (!email) {
      return toast.error("Please enter an email");
    }
    const parseResult = emailSchema.safeParse(email);
    if (!parseResult.success) {
      return toast.error("Please enter a valid email");
    }
    setLoading(true);
    const { data } = await axios.post("/api/user/change-email", {
      newEmail: email,
    });

    data.success
      ? (toast.success(data.message || "Email changed successfully"),
        setShowChangeEmailForm(false),
        setUser((prevUser) => {
          return { ...prevUser, email: email, isEmailVerified: false };
        }),
        setLoading(false))
      : toast.error(data.message || "Failed to change email");
  };
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white text-gray-500 max-w-96 mx-4 md:p-6 p-4 text-left text-sm rounded shadow-[0px_0px_10px_0px] shadow-black/10"
    >
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        Enter your new email
      </h2>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border mt-1 border-gray-500/30 focus:border-indigo-500 outline-none rounded py-2.5 px-4"
        type="email"
        placeholder="Enter your new email"
      />
      <button
        onClick={handleEmailChange}
        type="button"
        disabled={loading}
        className={`w-full my-3 ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        } cursor-pointer active:scale-95 transition py-2.5 rounded text-white`}
      >
        {loading ? "Please wait" : "Change Email"}
      </button>
    </div>
  );
};

export default ChangeEmailForm;
