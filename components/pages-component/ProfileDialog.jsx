"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function ProfileDialog({ open, onOpenChange }) {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
    }
  }, [session]);

  const handleSave = async () => {
    if (!name.trim() && (!currentPassword || !newPassword || newPassword !== confirmPassword)) {
      toast.error("Please check your inputs");
      return;
    }

    if (!window.confirm("Are you sure you want to save changes?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put("/api/users", { name, currentPassword, newPassword });
      if (res.status === 200) {
        toast.success("Profile updated successfully");
        update({ ...session, user: { ...session.user, name } });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onOpenChange(false);
        setTimeout(() => toast.success("All changes have been saved successfully!"), 500);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
          <hr />
          <h3 className="text-lg font-semibold">Change Password</h3>
          <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current Password" />
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" />
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
