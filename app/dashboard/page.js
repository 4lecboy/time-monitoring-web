"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, Download } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { io } from "socket.io-client";

export default function Dashboard() {
  const { data: session } = useSession();
  const [runningTime, setRunningTime] = useState(0);
  const [campaign, setCampaign] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setRunningTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.emit("getActiveAgents", { page: currentPage, limit });

    socket.on("activeAgents", (data) => {
      setAgents(data.agents);
      setTotalPages(data.totalPages);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentPage]);

  useEffect(() => {
    let filtered = agents;
    if (searchQuery) {
      filtered = filtered.filter(agent => agent.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (campaign) {
      filtered = filtered.filter(agent => agent.campaign === campaign);
    }
    setFilteredAgents(filtered);
  }, [searchQuery, campaign, agents]);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Welcome, {session?.user?.name}</h1>
        <span className="text-gray-600">{currentDate}</span>
      </header>
      
      <div className="bg-white p-4 shadow rounded-lg">
        <div className="flex justify-between items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <select
            className="border p-2 rounded"
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
          >
            <option value="">All Campaigns</option>
            <option value="IT">IT</option>
            <option value="Support">Support</option>
          </select>
          <button className="flex items-center bg-green-500 text-white px-4 py-2 rounded">
            <Download size={16} className="mr-2" /> Export Data
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-100 rounded-lg">
          <h2 className="text-lg font-bold mb-2">Active Agents</h2>
          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent) => (
              <div key={agent.id} className="bg-white p-3 my-2 shadow rounded-lg">
                <p><strong>Name:</strong> {agent.name}</p>
                <p><strong>Shift Date:</strong> {agent.shiftDate}</p>
                <p><strong>ID:</strong> {agent.id}</p>
                <p><strong>Campaign:</strong> {agent.campaign}</p>
                <p><strong>Time In:</strong> {agent.timeIn}</p>
                <p><strong>Status:</strong> {agent.status}</p>
              </div>
            ))
          ) : (
            <p>No active agents found.</p>
          )}

          <div className="flex justify-between mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-lg font-semibold">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
