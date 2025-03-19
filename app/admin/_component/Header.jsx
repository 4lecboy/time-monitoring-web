"use client";

import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { ChevronDown, LogOut, User, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import ProfileDialog from "./ProfileDialog";


export default function Header() {
  const { data: session } = useSession();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const now = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    setCurrentDate(now.toLocaleDateString("en-US", options));
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-md z-50 px-6 py-3 flex items-center justify-between rounded-b-xl"
    >
      {/* Left: Date Display */}
      <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
        <Calendar size={18} className="text-blue-500" />
        <span>{currentDate}</span>
      </div>

      {/* Right: User Dropdown */}
      <div className="relative">
        {session ? (
          <button
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
          >
            <span className="font-medium text-gray-900">
              {session.user.name} ({session.user.role})
            </span>
            <ChevronDown size={18} />
          </button>
        ) : (
          <span className="text-gray-600"></span>
        )}

        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border py-2"
          >
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 transition-all"
            >
              <User size={18} className="text-blue-500" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 transition-all"
            >
              <LogOut size={18} className="text-red-500" />
              <span>Logout</span>
            </button>
          </motion.div>
        )}
      </div>

      <ProfileDialog open={isProfileOpen} onOpenChange={setProfileOpen} />
    </motion.header>
  );
}
