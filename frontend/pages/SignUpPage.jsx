import {
  Eye,
  EyeOff,
  MessageSquare,
  User,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import { registerSchema } from "../validation/register";
import toast from "react-hot-toast";
import { loginSchema } from "../../backend/validation/login";

const SignUpPage = () => {
  const { axios, navigate, setUser, connectToSocket, setSelectedUser } =
    useAppContext();
  const [state, setState] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signUpError, setSignUpError] = useState();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const submitHandler = async (e) => {
    try {
      e.preventDefault();
      if (state === "signup" && !formData.name) {
        return setSignUpError("Name is required");
      }
      if (!formData.email) return setSignUpError("Email is required");
      if (!formData.password) return setSignUpError("Password is required");

      // Zod Validation
      state === "login"
        ? loginSchema.parse({
            email: formData.email,
            password: formData.password,
          })
        : registerSchema.parse({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          });

      // API call
      setLoading(true);
      const { data } = await axios.post(`/api/user/${state}`, formData);

      if (data.success) {
        navigate("/");
        setUser(data.user);
        setSelectedUser(null);
        connectToSocket();
        toast.success(data.message);
      } else {
        toast.error(data.message);
        setSignUpError(data.message);
      }
    } catch (error) {
      setSignUpError(JSON.parse(error));
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 sm:p-12">
      <div className="w-full max-w-md space-y-8">
        {/* LOGO */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2 group">
            <div
              className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
            >
              <MessageSquare className="size-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mt-2">
              {state === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-base-content/60">
              {state === "login"
                ? "Sign in to your account"
                : "Get started with your free account"}
            </p>
          </div>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          {state === "signup" && (
            <div className="form-control">
              <label className="label">
                {typeof signUpError === "string" &&
                signUpError.toLowerCase().includes("name") ? (
                  <span className="text-red-500">{signUpError}</span>
                ) : Array.isArray(signUpError) &&
                  signUpError[0].path.includes("name") ? (
                  <span className="text-red-500">{signUpError[0].message}</span>
                ) : (
                  <span className="label-text font-medium">Name</span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-2">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10 focus:outline-none`}
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setSignUpError("");
                  }}
                />
              </div>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              {typeof signUpError === "string" &&
              signUpError.toLowerCase().includes("email") ? (
                <span className="text-red-500">{signUpError}</span>
              ) : Array.isArray(signUpError) &&
                signUpError[0].path.includes("email") ? (
                <span className="text-red-500">{signUpError[0].message}</span>
              ) : (
                <span className="label-text font-medium">Email</span>
              )}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-2">
                <Mail className="size-5 text-base-content/40" />
              </div>
              <input
                type="text"
                className={`input input-bordered w-full pl-10 focus:outline-none`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setSignUpError("");
                }}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              {typeof signUpError === "string" &&
              signUpError.toLowerCase().includes("password is required") ? (
                <span className="text-red-500">{signUpError}</span>
              ) : Array.isArray(signUpError) &&
                signUpError[0].path.includes("password") ? (
                <span className="text-red-500">{signUpError[0].message}</span>
              ) : (
                <span className="text-label font-medium">Password</span>
              )}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-2">
                <Lock className="size-5 text-base-content/40" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className={`input input-bordered w-full pl-10 focus:outline-none`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setSignUpError("");
                }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center z-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye className="size-5 text-base-content/40" />
                ) : (
                  <EyeOff className="size-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>
          {state === "signup" && (
            <div className="form-control">
              <label className="label">
                {typeof signUpError === "string" &&
                signUpError.toLowerCase().includes("confirmPassword") ? (
                  <span className="text-red-500">{signUpError}</span>
                ) : Array.isArray(signUpError) &&
                  signUpError[0].path.includes("confirmPassword") ? (
                  <span className="text-red-500">{signUpError[0].message}</span>
                ) : (
                  <span className="text-label font-medium">
                    Confirm Password
                  </span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-2">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10 focus:outline-none`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    });
                    setSignUpError("");
                  }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center z-2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <Eye className="size-5 text-base-content/40" />
                  ) : (
                    <EyeOff className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>{state === "login" ? "Log in" : "Create Account"}</>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-base-content/60">
            {state === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <Link
              onClick={() => setState(state === "login" ? "signup" : "login")}
              className="link link-primary"
            >
              {state === "login" ? "Sign up" : "Log in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
