import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  addContact: async (email) => {
    try {
      const res = await axiosInstance.post("/messages/contacts/add", { email });
      toast.success("Contact added successfully");
      get().getUsers();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add contact");
      return false;
    }
  },

  removeContact: async (contactId) => {
    try {
      await axiosInstance.delete(`/messages/contacts/${contactId}`);
      toast.success("Contact removed successfully");
      if (get().selectedUser?._id === contactId) {
        set({ selectedUser: null });
      }
      get().getUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove contact");
    }
  },

  clearChat: async (userToChatId) => {
    try {
      await axiosInstance.delete(`/messages/chat/${userToChatId}`);
      toast.success("Chat history cleared");
      set({ messages: [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clear chat");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
