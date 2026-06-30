import { X, ArrowLeft, MoreVertical, Trash2, UserMinus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, removeContact, clearChat } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const handleClearChat = () => {
    if (window.confirm(`Are you sure you want to clear chat history with ${selectedUser.fullName}?`)) {
      clearChat(selectedUser._id);
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }
  };

  const handleRemoveContact = () => {
    if (window.confirm(`Are you sure you want to remove ${selectedUser.fullName} from your contacts?`)) {
      removeContact(selectedUser._id);
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300">
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
    </div>
  );
};
export default ChatHeader;
