"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import AddNewCampaign from "./AddNewCampaign";

function AddNewUsers({ onUsersAdded }) {
  const [open, setOpen] = useState(false);
  const [ashimaID, setAshimaID] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [campaign, setCampaign] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [usersType, setUsersType] = useState("");
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

    if (!ashimaID || !fullName || !email || !password || !campaign || !usersType) {
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
      const res = await axios.post("/api/users", {
        AshimaID: ashimaID,
        Name: fullName,
        EmailAddress: email,
        Password: password,
        Campaign: campaign,
        role: usersType,
      });

      if (res.status === 201) {
        toast.success("User added successfully!");
        setOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error("Axios Error:", err.response?.data || err.message);

      if (err.response?.status === 409) {
        setError("Email already exists. Please use a different email.");
      } else {
        setError("Failed to add user. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAshimaID("");
    setFullName("");
    setEmail("");
    setCampaign("");
    setUsersType("");
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

            <div className="flex justify-between items-center">
              <div className="w-4/5">
                <label>Campaign:</label>
                <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className="p-3 border rounded-lg w-full">
                  <option value="">Choose Campaign</option>
                  {campaigns.map((item, index) => (
                    <option key={index} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <AddNewCampaign onCampaignAdded={fetchCampaigns} />
            </div>

            <div>
              <label>User Type:</label>
              <select value={usersType} onChange={(e) => setUsersType(e.target.value)} className="p-3 border rounded-lg w-full">
                <option value="">Choose User Type</option>
                {["Agent", "Admin", "PDD"].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
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
