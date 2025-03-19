"use client";

import { useState, useEffect } from "react";
import { LogOut, Download } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: session } = useSession();
  const [runningTime, setRunningTime] = useState(0);
  const [campaign, setCampaign] = useState("");
  const [campaigns, setCampaigns] = useState([]);
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
    const fetchCampaigns = async () => {
      try {
        const response = await fetch("/api/campaigns");
        if (!response.ok) throw new Error("Failed to fetch campaigns");
        const data = await response.json();
        setCampaigns(data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };
    fetchCampaigns();
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
    const filtered = agents.filter(agent =>
      (!searchQuery || agent.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!campaign || agent.campaign === campaign)
    );
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
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {session?.user?.name}</h1>
      </header>
      
      <div className="bg-white p-6 shadow-lg rounded-lg">
        <div className="flex justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-3 rounded w-full shadow-sm"
          />
          <select
            className="border p-3 rounded shadow-sm"
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
          >
            <option value="">All Campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <Button className="flex items-center bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded shadow-md transition">
            <Download size={18} className="mr-2" /> Export Data
          </Button>
        </div>
        
        <div className="mt-6 p-6 bg-blue-50 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Active Agents</h2>
          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent) => (
              <div key={agent.id} className="bg-white p-4 my-3 shadow-md rounded-lg border border-gray-200">
                <p><strong>Name:</strong> {agent.name}</p>
                <p><strong>Shift Date:</strong> {agent.shiftDate}</p>
                <p><strong>ID:</strong> {agent.id}</p>
                <p><strong>Campaign:</strong> {agent.campaign}</p>
                <p><strong>Time In:</strong> {agent.timeIn}</p>
                <p><strong>Status:</strong> {agent.status}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No active agents found.</p>
          )}

        <div className="flex justify-between mt-4">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>Previous</Button>
            <span>Page {currentPage} of {totalPages}</span>
          <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>Next</Button>
        </div>
        </div>
      </div>
    </div>
  );
}