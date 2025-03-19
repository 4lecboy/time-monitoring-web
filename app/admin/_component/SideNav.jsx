"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FileText, Clock, Menu, X } from "lucide-react";
import { motion } from "framer-motion";

export default function SideNav() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Load sidebar state from localStorage (to remember user preference)
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  // Save sidebar state when toggled
  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar-collapsed", newState);
      return newState;
    });
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <Home size={20} /> },
    { name: "Employee", href: "/admin/employee", icon: <Users size={20} /> },
    { name: "Reports", href: "/admin/reports", icon: <FileText size={20} /> },
    { name: "Time Monitoring", href: "/time-monitoring", icon: <Clock size={20} /> },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white transition-all flex flex-col shadow-lg rounded-r-xl backdrop-blur-lg bg-opacity-70"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && <span className="font-bold text-lg">⚡ Logoipsum</span>}
        <motion.button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-all"
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {isCollapsed ? <Menu size={24} /> : <X size={24} />}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 px-4">
        {navItems.map(({ name, href, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 ${
              pathname === href
                ? "bg-purple-500 shadow-lg text-white"
                : "hover:bg-gray-700 hover:text-gray-200"
            }`}
          >
            {icon}
            <motion.span
              animate={{ opacity: isCollapsed ? 0 : 1, x: isCollapsed ? -10 : 0 }}
              transition={{ duration: 0.3 }}
              className={isCollapsed ? "hidden" : "font-medium"}
            >
              {name}
            </motion.span>
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}
