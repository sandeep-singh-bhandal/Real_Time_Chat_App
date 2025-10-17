import { LogOut, MessageSquare, Settings, User, User2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, axios, navigate, setUser, disconnectToSocket, setTheme } =
    useAppContext();
  return (
    <header
      className="border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <>
                <Link to={"/profile"}>
                  <div className="dropdown dropdown-hover dropdown-end ">
                    <div tabIndex={0} role="button" className="[&_li>a:active]:bg-transparent">
                        <img
                          className="aspect-[1/1] object-cover rounded-full w-10"
                          src={user.profilePic}
                          alt="Dp"
                        />
                    </div>
                    <ul
                      tabIndex="-1"
                      className="dropdown-content menu bg-base-100 rounded-box z-1 w-42 p-2 shadow-sm border border-gray-400 "
                    >
                      <li className="flex gap-2">
                        <div>
                          <User className="size-4" />
                          <Link to={"/profile"}>Profile</Link>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <div>
                          <Settings className="size-4" />
                          <Link to={"/settings"}>Settings</Link>
                        </div>
                      </li>
                    </ul>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
