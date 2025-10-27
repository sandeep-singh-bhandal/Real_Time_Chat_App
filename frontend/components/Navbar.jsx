import { MessageSquare, SettingsIcon, User2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";

const Navbar = () => {
  const { user, navigate } = useAppContext();
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
              <Dropdown>
                <DropdownTrigger className="active:outline-none focus:outline-none cursor-pointer">
                  <img
                    src={user?.profilePic}
                    className="size-10 object-cover rounded-full"
                    alt="profile"
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions" className="group">
                  <DropdownItem
                    key="profile"
                    onClick={() => navigate("/profile")}
                    startContent={<User2 className="size-5" />}
                  >
                    Profile
                  </DropdownItem>
                  <DropdownItem
                    key="copy"
                    startContent={<SettingsIcon className="size-5" />}
                    onClick={() => {
                      navigate("/settings");
                    }}
                  >
                    Settings
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
