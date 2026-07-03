import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    getMoreMessages,
    isLoadingMore,
    hasMoreMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [prevOldestId, setPrevOldestId] = useState(null);
  const [prevLastId, setPrevLastId] = useState(null);
  const [scrollHeightState, setScrollHeightState] = useState(0);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Reset trackers when user changes
  useEffect(() => {
    setPrevLastId(null);
    setPrevOldestId(null);
  }, [selectedUser._id]);

  // Scroll to bottom on initial load or new message
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    const isNewMessage = prevLastId && lastMsg._id !== prevLastId;
    const isInitialLoad = !prevLastId;

    if (isInitialLoad || isNewMessage) {
      messageEndRef.current?.scrollIntoView({ behavior: isInitialLoad ? "auto" : "smooth" });
    }

    setPrevLastId(lastMsg._id);
  }, [messages, prevLastId]);

  // Maintain scroll position when older messages are loaded
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || messages.length === 0) return;

    const oldestMsg = messages[0];
    if (prevOldestId && oldestMsg._id !== prevOldestId) {
      // Adjust scroll position so it doesn't jump
      container.scrollTop = container.scrollHeight - scrollHeightState;
    }

    setPrevOldestId(oldestMsg._id);
    setScrollHeightState(container.scrollHeight);
  }, [messages, prevOldestId, scrollHeightState]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && hasMoreMessages && !isMessagesLoading && !isLoadingMore) {
      setScrollHeightState(container.scrollHeight);
      getMoreMessages(selectedUser._id);
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoadingMore && (
          <div className="flex justify-center p-2">
            <span className="loading loading-spinner loading-sm text-primary"></span>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
