"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import AddNewUsers from "./_components/AddNewUser";
import CampaignList from "./_components/CampaignList";

export default function EmployeePage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCampaign, setFilterCampaign] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("/api/users");
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users.");
    }
  };

  const handleDelete = async (ashima_id) => {
    try {
      await axios.delete(`/api/users?ashima_id=${ashima_id}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user.");
    }
  };

  const filteredUsers = users.filter((emp) => {
    return (
      (emp.ashima_id?.toLowerCase().includes(search.toLowerCase()) ||
        emp.name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.email?.toLowerCase().includes(search.toLowerCase())) &&
      (filterCampaign ? emp.campaign_id && emp.campaign_id.toString() === filterCampaign : true)
    );
  });

  return (
    <div className="p-5">
      <div className="flex justify-between space-x-5">
        <h1 className="text-2xl font-bold mb-4">Employee Management</h1>
        <div className="flex space-x-5">
          <CampaignList />
          <AddNewUsers />
        </div>
      </div>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by ID, Name, or Email"
          className="border p-2 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={filterCampaign}
          onChange={(e) => setFilterCampaign(e.target.value)}
        >
          <option value="">All Campaigns</option>
          {[...new Set(users.map((emp) => emp.campaign_id))]
            .filter(Boolean)
            .map((campaign, index) => (
              <option key={index} value={campaign}>
                Campaign #{campaign}
              </option>
            ))}
        </select>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 border">Ashima ID</th>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Campaign ID</th>
            <th className="p-3 border">Role</th>
            <th className="p-3 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((emp) => (
              <tr key={emp.ashima_id} className="border">
                <td className="p-3 border">{emp.ashima_id || "N/A"}</td>
                <td className="p-3 border">{emp.name || "N/A"}</td>
                <td className="p-3 border">{emp.email || "N/A"}</td>
                <td className="p-3 border">{emp.campaign_id || "N/A"}</td>
                <td className="p-3 border">{emp.role || "N/A"}</td>
                <td className="p-3 border">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(emp.ashima_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-3 text-center">No users found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
