import { Smile, X } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const ReactionInfoModal = ({ reactedMessage, setReactedMessage }) => {
  const { user } = useAppContext();
  return (
    <div
      onClick={() => setReactedMessage(false)}
      className="absolute inset-0 backdrop-blur-xs flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 w-[90%] sm:w-[420px] md:w-[480px] max-h-[85vh] overflow-y-auto p-0 transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 p-4 border-b border-gray-200 dark:border-zinc-700 z-10">
          <div className="flex items-center gap-2 text-blue-500 font-semibold">
            <Smile className="size-5" />
            <span>Reactions</span>
          </div>
          <button
            onClick={() => setReactedMessage(false)}
            className="p-1.5 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Message bubble */}
        <div className="p-5 border-b border-gray-200 dark:border-zinc-700">
          {reactedMessage?.imageData?.url && (
            <img
              src={reactedMessage.imageData.url}
              alt="Message"
              className="rounded-lg border border-gray-300 dark:border-zinc-700 mb-3 max-h-56 object-cover"
            />
          )}
          {reactedMessage?.text && (
            <p className="text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg whitespace-pre-wrap break-words">
              {reactedMessage.text}
            </p>
          )}
        </div>

        {/* Sent / Seen info */}
        <div className="p-5">
          <h3 className="text-gray-600 dark:text-gray-300 text-sm font-semibold mb-3">
            Reactions
          </h3>
          <ul className="flex flex-col gap-3">
            {reactedMessage?.reactions.length > 0 ? (
              reactedMessage?.reactions.map((reaction, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={reaction.userId?.profilePic || "/default-avatar.png"}
                      alt={reaction.userId.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-zinc-700"
                    />
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {reaction.userId._id === user._id
                        ? `${reaction.userId.name} (You)`
                        : reaction.userId.name}
                    </span>
                  </div>
                  <span className="text-xl text-gray-500 dark:text-gray-400">
                    {reaction.emoji}
                  </span>
                </li>
              ))
            ) : (
              <p className="text-xs text-gray-400">No views yet</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReactionInfoModal;
