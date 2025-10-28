import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const DeleteMessageModal = ({ setShowMessageDeleteModal, msgToBeDeleted }) => {
  const { selectedUser, axios } = useAppContext();
  // Message Deleting Handler
  const handleDeleteMessage = async (e) => {
    const { data } = await axios.delete(
      `/api/message/delete-message/${msgToBeDeleted._id}`
    );
    data.success
      ? (toast.success(data.message), setShowMessageDeleteModal(false))
      : toast.error(data.message);
  };
  return (
    <div
      onClick={() => setShowMessageDeleteModal(false)}
      className="absolute top-0 backdrop-blur-xs left-0 w-full h-full flex items-center justify-center z-50"
    >
      <div
        className="flex flex-col items-center bg-white shadow-md rounded-xl py-6 px-5 md:w-[460px] w-[370px] border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center p-4 bg-red-100 rounded-full">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.875 5.75h1.917m0 0h15.333m-15.333 0v13.417a1.917 1.917 0 0 0 1.916 1.916h9.584a1.917 1.917 0 0 0 1.916-1.916V5.75m-10.541 0V3.833a1.917 1.917 0 0 1 1.916-1.916h3.834a1.917 1.917 0 0 1 1.916 1.916V5.75m-5.75 4.792v5.75m3.834-5.75v5.75"
              stroke="#DC2626"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-gray-900 font-semibold mt-4 text-xl">
          Delete Message?
        </h2>
        <p className="mt-1">
          This will delete the message for {selectedUser.name} too
        </p>
        <div className="flex items-center justify-center gap-4 mt-5 w-full">
          <button
            type="button"
            className="w-full md:w-36 h-10 rounded-md border border-gray-300 bg-white text-gray-600 font-medium text-sm hover:bg-gray-100 active:scale-95 transition cursor-pointer"
            onClick={() => setShowMessageDeleteModal(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteMessage}
            className="w-full md:w-36 h-10 rounded-md text-white bg-red-600 font-medium text-sm hover:bg-red-700 active:scale-95 transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMessageModal;
