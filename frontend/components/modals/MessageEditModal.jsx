import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const MessageEditModal = ({ setShowMessageEditingModal, newText, setNewText }) => {
  const { axios } = useAppContext();

  // Message Editing Handler
  const handleEditText = async (e) => {
    e.preventDefault();
    const { data } = await axios.patch("/api/message/edit-message", {
      messageId: newText._id,
      editedMessageText: newText.text,
    });
    data.success
      ? setShowMessageEditingModal(false)
      : toast.error(data.message);
  };


  return (
    <div
      onClick={() => setShowMessageEditingModal(false)}
      className="absolute top-0 backdrop-blur-xs left-0 w-full h-full flex items-center justify-center z-50"
    >
      <div
        className="flex flex-col bg-white shadow-md rounded-xl py-6 px-5 md:w-[370px] w-[300px] border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-lg text-left">Edit Text</h1>
        <form
          onSubmit={handleEditText}
          id="editTextForm"
          className="flex flex-col justify-center gap-4 mt-3 w-full"
        >
          <textarea
            ref={(el) => {
              if (el) {
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }
            }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            name="editText"
            className="border border-gray-400 w-full rounded-md px-3 py-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            autoFocus
            value={newText.text || ""}
            onChange={(e) =>
              setNewText({
                ...newText,
                text: e.target.value,
              })
            }
            placeholder="Edit your message..."
          />
          <div className="flex gap-7 justify-between">
            <button
              type="button"
              className="w-full md:w-36 h-10 rounded-md border border-gray-300 bg-white text-gray-600 font-medium text-sm hover:bg-gray-100 active:scale-95 transition cursor-pointer"
              onClick={() => setShowMessageEditingModal(false)}
            >
              Cancel
            </button>
            <button
              form="editTextForm"
              type="submit"
              disabled={newText.text.length === 0}
              className="w-full md:w-36 h-10 rounded-md text-white bg-blue-600 font-medium text-sm hover:bg-blue-700 active:scale-95 transition cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageEditModal;
