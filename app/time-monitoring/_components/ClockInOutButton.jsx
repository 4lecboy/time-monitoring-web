"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function ClockInOutButton({ ashima_id }) {
  const [isClockedIn, setIsClockedIn] = useState(false);

  // ✅ Fetch clock status when component mounts
  useEffect(() => {
    checkClockStatus();
  }, []);

  const checkClockStatus = async () => {
    try {
      const res = await axios.get(`/api/time-tracking/clock-status?ashima_id=${ashima_id}`);
      setIsClockedIn(res.data.isClockedIn);
    } catch (error) {
      console.error("❌ Error checking clock status:", error);
    }
  };

  const handleClockIn = async () => {
    try {
      await axios.post("/api/time-tracking/clock-in", { ashima_id });
      setIsClockedIn(true);
      toast.success("Clocked in successfully!");
    } catch (error) {
      toast.error("Failed to clock in.");
    }
  };

  const handleClockOut = async () => {
    try {
      await axios.post("/api/time-tracking/clock-out", { ashima_id, logout_by: ashima_id });
      setIsClockedIn(false);
      toast.success("Clocked out successfully!");
    } catch (error) {
      toast.error("Failed to clock out.");
    }
  };

  return (
    <div className="text-center mt-4">
      <Button
        onClick={isClockedIn ? handleClockOut : handleClockIn}
        className={`px-6 py-3 text-xl ${isClockedIn ? "bg-red-600" : "bg-green-600"}`}
      >
        {isClockedIn ? "Time Out" : "Time In"}
      </Button>
    </div>
  );
}
