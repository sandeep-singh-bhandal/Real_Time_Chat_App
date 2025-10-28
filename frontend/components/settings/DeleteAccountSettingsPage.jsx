import { useAppContext } from "../../context/AppContext";
import DeleteAccountModal from "../modals/DeleteAccountModal";

const DeleteAccountSettingsPage = () => {
  const { showDeleteAccountModal, setShowDeleteAccountModal } = useAppContext();
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900">Delete Account</h2>
        <p className="text-gray-500 mt-2">
          Permanently delete your account and all associated data
        </p>
      </div>

      <div className="bg-red-50 rounded-lg p-6 border border-red-200">
        <h3 className="text-base font-semibold text-red-700 mb-3">
          Permanently Delete Your Account
        </h3>
        <p className="text-red-600 text-sm mb-6">
          This action cannot be undone. All your data, messages, and profile
          information will be permanently deleted.
        </p>
        <button onClick={()=>setShowDeleteAccountModal(true)} className="px-4 cursor-pointer py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
          Delete My Account
        </button>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Before You Go
        </h3>
        <ul className="space-y-3">
          {[
            "Download your data before deletion",
            "Notify your contacts about your departure",
            "This will remove you from all groups",
          ].map((item, idx) => (
            <li key={idx} className="flex gap-3 items-start">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 flex-shrink-0 text-xs font-semibold">
                ✓
              </span>
              <span className="text-gray-700 text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      {showDeleteAccountModal && (
        <div
          onClick={() => setShowDeleteAccountModal(false)}
          className="w-full h-full backdrop-blur-sm fixed inset-0 flex justify-center items-center"
        >
          <DeleteAccountModal />
        </div>
      )}
    </div>
  );
};

export default DeleteAccountSettingsPage;
