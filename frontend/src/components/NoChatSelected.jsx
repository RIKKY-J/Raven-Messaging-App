import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
             justify-center animate-bounce text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                <path d="M12,2C11.5,2.8 10.8,4.2 10.2,5.5C8,6.8 5.5,7.2 3,7C4.8,8.2 7,8.8 9.2,8.8C8.8,10.2 8.2,11.8 7.5,13.2C8.8,12.8 10.2,12.2 11.5,11.5C11.8,12.8 12,14.2 12,15.5C12,14.2 12.2,12.8 12.5,11.5C13.8,12.2 15.2,12.8 16.5,13.2C15.8,11.8 15.2,10.2 14.8,8.8C17,8.8 19.2,8.2 21,7C18.5,7.2 16,6.8 13.8,5.5C13.2,4.2 12.5,2.8 12,2Z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Welcome to Crow!</h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
