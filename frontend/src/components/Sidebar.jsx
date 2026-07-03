import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Plus } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, addContact } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [emailInput, setEmailInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const success = await addContact(emailInput.trim());
    if (success) {
      setEmailInput("");
      setIsAdding(false);
    }
  };

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className={`w-full lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 ${selectedUser ? "hidden lg:flex" : "flex"}`}>
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium">Contacts</span>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn btn-ghost btn-xs btn-circle grid"
            title="Add Contact"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddContact} className="mt-3 flex gap-2">
            <input
              type="email"
              placeholder="Enter user email..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="input input-bordered input-xs flex-1 w-full"
              required
            />
            <button type="submit" className="btn btn-primary btn-xs">
              Add
            </button>
          </form>
        )}

        {/* Show Online Only toggle */}
        <div className="mt-3 flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-xs"
            />
            <span className="text-xs text-zinc-500">Show online only</span>
          </label>
          <span className="text-xs text-zinc-400">
            ({users.filter((u) => onlineUsers.includes(u._id)).length} online)
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info */}
            <div className="text-left min-w-0 flex-1">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            {showOnlineOnly ? "No online users" : "No contacts yet. Add by email!"}
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
