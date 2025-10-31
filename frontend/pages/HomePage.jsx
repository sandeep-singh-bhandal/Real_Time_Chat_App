import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { useAppContext } from "../context/AppContext";
import Sidebar from "../components/Sidebar";
import { ProfileView } from "../components/ProfileView";

const HomePage = () => {
  const { selectedUser, isReceiverProfileOpen } = useAppContext();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 max-sm:h-full max-sm:pt-16 px-4 max-sm:px-0">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-6rem)] max-sm:h-full">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedUser ? (
              <NoChatSelected />
            ) : isReceiverProfileOpen ? (
              <ProfileView />
            ) : (
              <ChatContainer />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
