import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import SettingsPage from "../pages/SettingsPage";
import ProfilePage from "../pages/ProfilePage";
import HomePage from "../pages/HomePage";
import { useAppContext } from "../context/AppContext";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "react-hot-toast";
import SignUpPage from "../pages/SignUpPage";

const App = () => {
  const { user, checkAuth, isCheckingAuth, theme   } = useAppContext();
  
  useEffect(() => {
    checkAuth();
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="size-10 animate-spin" />
        <span className="mt-2">
          Please wait a bit longer, backend could be on sleep mode ( 10seconds max )
        </span>
      </div>
    );
  }

  return (
    <div data-theme={"corporate"}>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={user ? <HomePage /> : <Navigate to={"/signup"} />}
        />
        <Route
          path="/signup"
          element={!user ? <SignUpPage /> : <Navigate to={"/"} />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to={"/login"} />}
        />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
