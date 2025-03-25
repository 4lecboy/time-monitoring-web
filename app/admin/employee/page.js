"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import AddNewUsers from "./_components/AddNewUser";
import CampaignList from "./_components/CampaignList";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "./_components/ConfirmDialog";

export default function EmployeePage() {
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCampaign, setFilterCampaign] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({ open: false, ashima_id: null });

  useEffect(() => {
    fetchUsers();
    fetchCampaigns();
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

  const fetchCampaigns = async () => {
    try {
      const { data } = await axios.get("/api/campaigns");
      setCampaigns(data);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      toast.error("Failed to fetch campaigns.");
    }
  };

  const handleDelete = async () => {
    try {
      if (!confirmDialog.ashima_id) return;

      await axios.delete(`/api/users?ashima_id=${confirmDialog.ashima_id}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user.");
    } finally {
      setConfirmDialog({ open: false, ashima_id: null });
    }
  };

  const filteredUsers = users.filter((emp) => {
    return (
      (emp.ashima_id?.toLowerCase().includes(search.toLowerCase()) ||
        emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.email?.toLowerCase().includes(search.toLowerCase())) &&
      (filterCampaign ? emp.campaign_id?.toString() === filterCampaign : true)
    );
  });

  return (
    <div className="p-5">
      <div className="flex justify-between space-x-5">
        <h1 className="text-2xl font-bold mb-4">Employee Management</h1>
        <div className="flex space-x-5">
          <CampaignList fetchCampaigns={fetchCampaigns} campaigns={campaigns} setFilterCampaign={setFilterCampaign} />
          <AddNewUsers fetchUsers={fetchUsers} campaigns={campaigns} />
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
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 border">Ashima ID</th>
            <th className="p-3 border">Full Name</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Campaign</th>
            <th className="p-3 border">Role</th>
            <th className="p-3 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((emp) => (
              <tr key={emp.ashima_id} className="border">
                <td className="p-3 border">{emp.ashima_id || "N/A"}</td>
                <td className="p-3 border">{emp.full_name || "N/A"}</td>
                <td className="p-3 border">{emp.email || "N/A"}</td>
                <td className="p-3 border">
                  {campaigns.find((c) => c.id === emp.campaign_id)?.name || "N/A"}
                </td>
                <td className="p-3 border">{emp.role || "N/A"}</td>
                <td className="p-3 border">
                  <Button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => setConfirmDialog({ open: true, ashima_id: emp.ashima_id })}
                  >
                    Delete
                  </Button>
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, ashima_id: null })}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this user?"
      />
    </div>
  );
}
