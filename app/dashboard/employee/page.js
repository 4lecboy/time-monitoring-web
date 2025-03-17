"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import AddNewuser from "@/components/pages-component/AddNewUser";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebounce } from "use-debounce";
import ConfirmDialog from "@/components/reusable/ConfirmDialog";
import { Button } from "@/components/ui/button";
import CampaignList from "@/components/pages-component/CampaignList";

export default function userPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCampaign, setFilterCampaign] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  
  // Fetch users from Backend
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

  // Delete user
  const [confirmDialog, setConfirmDialog] = useState({ open: false, userId: null });

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`/api/users?id=${confirmDialog.userId}`);
      setUsers((prev) => prev.filter((emp) => emp.id !== confirmDialog.userId));
      toast.success("User removed successfully!");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user.");
    } finally {
      setConfirmDialog({ open: false, userId: null }); // Close modal
    }
  };

  // Open dialog when delete button is clicked
  const confirmDelete = (id) => {
    setConfirmDialog({ open: true, userId: id });
  };

  // Filter users based on search input & campaign selection
  const filteredUsers = users.filter((emp) => {
    return (
      (emp.AshimaID.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
       emp.Name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
       emp.EmailAddress.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
      (filterCampaign ? emp.Campaign === filterCampaign : true)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">User Management</h1>
        <div className="flex space-x-4">
          <CampaignList />
          <AddNewuser onUserAdded={fetchUsers} />
        </div>
      </div>

      {/* Total Accounts */}
      <div>
        <Card className="p-4 text-center shadow">
          <CardHeader>
            <CardTitle className="text-lg">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder="Search by Ashima ID, name, or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-2/3"
        />
        <select
          value={filterCampaign}
          onChange={(e) => setFilterCampaign(e.target.value)}
          className="p-3 border rounded-lg w-1/3"
        >
          <option value="">All Campaigns</option>
          {Array.from(new Set(users.map((user) => user.Campaign))).map((campaign) => (
            <option key={campaign} value={campaign}>{campaign}</option>
          ))}
        </select>
      </div>

      {/* User List */}
      <table className="w-full bg-blue-50 shadow-md rounded overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Ashima ID</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Campaign</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((emp) => (
              <tr key={emp.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{emp.AshimaID}</td>
                <td className="p-3">{emp.Name}</td>
                <td className="p-3">{emp.EmailAddress}</td>
                <td className="p-3">{emp.Campaign}</td>
                <td className="p-3">{emp.role}</td>
                <td className="p-3">
                  <ConfirmDialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, userId: null })} onConfirm={handleDeleteUser} message="Are you sure you want to delete this user?" />
                  <Button className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-2 hover:bg-red-700 transition" onClick={() => confirmDelete(emp.id)}>
                    <Trash2 size={16} /> Remove
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <Button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>Previous</Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>Next</Button>
      </div>
    </div>
  );
}
