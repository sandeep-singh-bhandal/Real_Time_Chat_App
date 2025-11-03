import { useRef } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const OtpForm = ({ emailToBeVerified }) => {
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const { axios, setShowOtpForm, setUser } = useAppContext();

  //   Handler Functions
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };
  const handleChange = () => {
    const code = inputRefs.current.map((val) => val.value).join("");
    setOtp(code);
  };

  // Function to verify OTP 
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!otp || otp.length < 6) {
        return toast.error("Please enter the 6-digit code");
      }

      setLoading(true);

      const { data } = await axios.post("/api/user/verify-code", {
        email: emailToBeVerified,
        otp,
      });

      if (data.success) {
        toast.success("Your email has been verified!");
        setShowOtpForm(false);
        setUser((prev) => ({ ...prev, isEmailVerified: true }));
      } else {
        toast.error(data.message || "Invalid or expired code");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while verifying");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onClick={(e) => e.stopPropagation()}
      onSubmit={handleCodeSubmit}
      className="bg-white text-gray-500 max-w-96 mx-4 md:py-10 md:px-6 px-4 py-8 text-left text-sm rounded-lg transition-all shadow-[0px_0px_10px_0px] shadow-black/10"
    >
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
        Verify Your Email
      </h2>
      <p clas>Please enter the verification code</p>
      <p className="text-gray-500/60 mb-4">
        The code has been sent to your registered email
      </p>
      <div
        className="flex items-center justify-between mb-6"
        onPaste={handlePaste}
      >
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <input
              key={index}
              autoFocus={index === 0 ? true : false}
              autoComplete="off"
              name="code"
              className="otp-input w-10 h-10 border-2 border-gray-300 outline-none rounded text-center text-lg focus:border-primary transition duration-300"
              type="text"
              maxLength="1"
              ref={(e) => (inputRefs.current[index] = e)}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onChange={handleChange}
            />
          ))}
      </div>
      <button
        type="submit"
        disabled={loading ? true : false}
        className={`${
          loading ? "bg-gray-300" : "bg-primary hover:bg-primary-dull"
        }  flex justify-center items-center gap-1 w-full my-1 cursor-pointer py-2.5 rounded text-white active:scale-95 transition`}
      >
        {loading ? "Verifying" : "Verify"}
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

export default OtpForm;
