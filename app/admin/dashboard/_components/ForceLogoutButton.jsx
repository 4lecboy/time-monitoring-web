"use client";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function ForceLogoutButton({ targetAshimaId, adminAshimaId }) {
  const handleForceLogout = async () => {
    try {
      await axios.post("/api/time-tracking/clock-out", {
        ashima_id: targetAshimaId,
        logout_by: adminAshimaId,
      });

      toast.success(`User ${targetAshimaId} logged out by ${adminAshimaId}`);
    } catch (error) {
      toast.error("Failed to force logout.");
    }
  };

  return (
    <Button onClick={handleForceLogout} className="bg-red-600 px-4 py-2">
      Force Logout
    </Button>
  );
}
