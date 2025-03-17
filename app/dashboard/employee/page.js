"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import AddNewuser from "@/components/pages-component/AddNewUser";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebounce } from "use-debounce";
import ConfirmDialog from "@/components/reusable/ConfirmDialog";

export default function userPage() {
  const [users, setusers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  


  // Fetch users from Backend
  useEffect(() => {
    fetchusers();
  }, []);

  const fetchusers = async () => {
    try {
      const { data } = await axios.get("/api/users"); // ✅ Ensure correct route
      setusers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users.");
    }
  };

  // Delete user
  const [confirmDialog, setConfirmDialog] = useState({ open: false, userId: null });

const handleDeleteuser = async () => {
  try {
    await axios.delete(`/api/users?id=${confirmDialog.userId}`);
    setusers((prev) => prev.filter((emp) => emp.id !== confirmDialog.userId));
    toast.success("user removed successfully!");
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
  

  // Filter users based on search input & role selection
  const filteredusers = users.filter((emp) => {
    return (
      (emp.Name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      emp.EmailAddress.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
      (filterRole ? emp.role === filterRole : true)
    );
  });

  // Analytics Data
  // Count total users and roles
  const totalUsers = users.length;
  const roleCounts = users.reduce((acc, emp) => {
    const roleKey = emp.role.toLowerCase(); // Convert role to lowercase
    acc[roleKey] = (acc[roleKey] || 0) + 1;
    return acc;
  }, {});

  // ✅ Ensure admin count is included
  const totalAdmins = roleCounts["admin"] || 0;
  const totalPDD = roleCounts["pdd"] || 0;
  const totalAgents = roleCounts["agent"] || 0;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">user Management</h1>
        <AddNewuser onuserAdded={fetchusers} />
      </div>

      {/* user Analytics Summary */}
  <div className="grid grid-cols-3 gap-4 mb-6">
  <Card className="p-4 text-center shadow">
    <CardHeader>
      <CardTitle className="text-lg">Total users</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{totalUsers}</p> {/* ✅ Fix here */}
    </CardContent>
  </Card>
    <Card className="p-4 text-center shadow">
    <CardHeader>
      <CardTitle className="text-lg">Admins</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{roleCounts["admin"] || 0}</p>
    </CardContent>
  </Card>

  <Card className="p-4 text-center shadow">
    <CardHeader>
      <CardTitle className="text-lg">Agents</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{roleCounts["agent"] || 0}</p>
    </CardContent>
  </Card>
    

</div>

      {/* 🔍 Search & Filter */}
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder="Search by name, email, or campaign"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-2/3"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="p-3 border rounded-lg w-1/3"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Agent">Agent</option>
          <option value="PDD">PDD</option>
        </select>
      </div>

      {/* 📝 user List */}
      <table className="w-full bg-white shadow-md rounded overflow-hidden">
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
          {filteredusers.length > 0 ? (
            filteredusers.map((emp) => (
              <tr key={emp.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{emp.AshimaID}</td>
                <td className="p-3">{emp.Name}</td>
                <td className="p-3">{emp.EmailAddress}</td>
                <td className="p-3">{emp.Campaign}</td>
                <td className="p-3">{emp.role}</td>
                <td className="p-3">
                <ConfirmDialog 
                    open={confirmDialog.open} 
                    onClose={() => setConfirmDialog({ open: false, userId: null })}
                    onConfirm={handleDeleteuser}
                    message="Are you sure you want to delete this user?"
                  />

                  <button 
                    className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-2 hover:bg-red-700 transition" 
                    onClick={() => confirmDelete(emp.id)}
                  >
                    <Trash2 size={16} /> Remove
                  </button>

                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
