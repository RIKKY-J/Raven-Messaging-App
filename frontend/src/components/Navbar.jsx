import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12,2C11.5,2.8 10.8,4.2 10.2,5.5C8,6.8 5.5,7.2 3,7C4.8,8.2 7,8.8 9.2,8.8C8.8,10.2 8.2,11.8 7.5,13.2C8.8,12.8 10.2,12.2 11.5,11.5C11.8,12.8 12,14.2 12,15.5C12,14.2 12.2,12.8 12.5,11.5C13.8,12.2 15.2,12.8 16.5,13.2C15.8,11.8 15.2,10.2 14.8,8.8C17,8.8 19.2,8.2 21,7C18.5,7.2 16,6.8 13.8,5.5C13.2,4.2 12.5,2.8 12,2Z"/>
                </svg>
              </div>
              <h1 className="text-lg font-bold">Crow</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
