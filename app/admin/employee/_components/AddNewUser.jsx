"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

function AddNewUsers({ fetchUsers }) {
  const [open, setOpen] = useState(false);
  const [ashimaID, setAshimaID] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [campaignID, setCampaignID] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [role, setRole] = useState("employee"); // Default to employee
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetchCampaigns();
    }
  }, [open]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await axios.get("/api/campaigns");
      setCampaigns(data);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      toast.error("Failed to fetch campaigns.");
    }
  };

  const handleSave = async () => {
    setError("");
    setLoading(true);
  
    if (!ashimaID || !fullName || !email || !password || !campaignID || !role) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
  
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
  
    try {
      console.log("🔍 Sending request to /api/users:", {
        ashima_id: ashimaID,
        full_name: fullName,
        email,
        password,
        campaign_id: campaignID,
        role,
        status: "active",
      });
  
      const res = await axios.post("/api/users", {
        ashima_id: ashimaID,
        full_name: fullName,
        email,
        password,
        campaign_id: campaignID,
        role,
        status: "active",
      });
  
      console.log("✅ User created successfully:", res);
  
      if (res.status === 201) {
        toast.success("User added successfully!");
        fetchUsers(); // ✅ Refresh users list
        setOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error("❌ Axios Error:", err);
  
      if (err.response) {
        console.error("🔴 Server Response:", err.response);
        setError(err.response.data.error || "Failed to add user.");
      } else if (err.request) {
        console.error("🟠 No Response from Server:", err.request);
        setError("No response from the server. Please check your network.");
      } else {
        console.error("⚠️ Request Setup Error:", err.message);
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  

  const resetForm = () => {
    setAshimaID("");
    setFullName("");
    setEmail("");
    setCampaignID("");
    setRole("employee"); // Reset to default role
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)}>
        <PlusCircle size={18} /> Add User
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input value={ashimaID} onChange={(e) => setAshimaID(e.target.value)} placeholder="Ashima ID" />
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" />
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" />

            <div>
              <label>Campaign:</label>
              <select
                value={campaignID}
                onChange={(e) => setCampaignID(e.target.value)}
                className="p-3 border rounded-lg w-full"
              >
                <option value="">Choose Campaign</option>
                {campaigns.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>User Type:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="p-3 border rounded-lg w-full"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
                <option value="pdd">PDD</option>
              </select>
            </div>

            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />

            {error && <p className="text-red-500">{error}</p>}

            <div className="flex gap-3 items-center justify-end mt-5">
              <Button onClick={() => setOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Create Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewUsers;
