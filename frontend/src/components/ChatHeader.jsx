import { useState } from "react";
import { X, ArrowLeft, MoreVertical, Trash2, UserMinus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, removeContact, clearChat } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [confirmType, setConfirmType] = useState(null); // 'clear' | 'remove' | null

  const handleClearChat = () => {
    setConfirmType("clear");
    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  const handleRemoveContact = () => {
    setConfirmType("remove");
    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          <button 
            onClick={() => setSelectedUser(null)} 
            className="lg:hidden btn btn-ghost btn-xs btn-circle"
          >
            <ArrowLeft className="size-5" />
          </button>

          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* More settings dropdown */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-xs btn-circle cursor-pointer">
              <MoreVertical className="size-5" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow-lg bg-base-200 rounded-box w-52 border border-base-300 z-50 mt-1"
            >
              <li>
                <button onClick={handleClearChat} className="text-error flex items-center gap-2 hover:bg-base-300">
                  <Trash2 className="size-4" />
                  <span>Clear Chat History</span>
                </button>
              </li>
              <li>
                <button onClick={handleRemoveContact} className="text-error flex items-center gap-2 hover:bg-base-300">
                  <UserMinus className="size-4" />
                  <span>Remove Contact</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Close button */}
          <button onClick={() => setSelectedUser(null)} className="hidden lg:block btn btn-ghost btn-xs btn-circle">
            <X className="size-5" />
          </button>
        </div>
      </div>

      {confirmType && (
        <div className="modal modal-open z-50">
          <div className="modal-box bg-base-200 border border-base-300 max-w-sm">
            <h3 className="font-bold text-lg text-base-content">Are you sure?</h3>
            <p className="py-4 text-sm text-base-content/80">
              {confirmType === "clear"
                ? `This will delete all messages and media files in your chat with ${selectedUser.fullName} permanently.`
                : `This will remove ${selectedUser.fullName} from your contacts list.`}
            </p>
            <div className="modal-action gap-2">
              <button onClick={() => setConfirmType(null)} className="btn btn-ghost btn-sm rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmType === "clear") {
                    clearChat(selectedUser._id);
                  } else {
                    removeContact(selectedUser._id);
                  }
                  setConfirmType(null);
                }}
                className="btn btn-error btn-sm rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black/40" onClick={() => setConfirmType(null)}></div>
        </div>
      )}
    </div>
  );
};
export default ChatHeader;
