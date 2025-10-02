import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import SignUpPage from "../pages/SignUpPage";
import LoginPage from "../pages/LoginPage";
import SettingsPage from "../pages/SettingsPage";
import ProfilePage from "../pages/ProfilePage";
import HomePage from "../pages/HomePage";
import { useAppContext } from "../context/AppContext";
import { useEffect } from "react";
import { Loader } from "lucide-react";

const App = () => {
  const { user, checkAuth, isCheckingAuth } = useAppContext();
  useEffect(() => {
    checkAuth();
  }, []);
  console.log(isCheckingAuth);
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/test" element={<h1>Test Page Working</h1>} />

        <Route
          path="/"
          element={user ? <HomePage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/signup"
          element={!user ? <SignUpPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to={"/"} />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to={"/login"} />}
        />
      </Routes>
    </div>
  );
};

export default App;
