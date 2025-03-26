"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-hot-toast";
import clsx from "clsx";

export default function ClockInOutButton({ ashima_id, isClockedIn, setIsClockedIn }) {
  const [loading, setLoading] = useState(false);

  // ✅ Define a stable function for fetching clock status
  const checkClockStatus = useCallback(async () => {
    if (!ashima_id) return;
    
    try {
      const res = await axios.get(`/api/time-tracking/clock-status?ashima_id=${ashima_id}`);
      setIsClockedIn(res.data.isClockedIn);
    } catch (error) {
      console.error("Error checking clock status:", error);
      setIsClockedIn(false);
    }
  }, [ashima_id, setIsClockedIn]);

  // ✅ Only `ashima_id` is in the dependency array, ensuring stability
  useEffect(() => {
    checkClockStatus();
  }, [checkClockStatus]); 

  const handleClockIn = async () => {
    if (loading || isClockedIn) return;
    setLoading(true);

    try {
      const res = await axios.post("/api/time-tracking/clock-in", { ashima_id });
      setIsClockedIn(res.data.isClockedIn);
      toast.success("Clocked in successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to clock in.");
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (loading || !isClockedIn) return;
    setLoading(true);

    try {
      await axios.post("/api/time-tracking/clock-out", { ashima_id, logout_by: ashima_id });
      setIsClockedIn(false);
      toast.success("Clocked out successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to clock out.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center mt-4">
      <Button
        onClick={isClockedIn ? handleClockOut : handleClockIn}
        className={clsx(
          "px-6 py-3 text-xl transition-opacity",
          isClockedIn ? "bg-red-600" : "bg-green-600",
          loading && "opacity-50 cursor-not-allowed"
        )}
        disabled={loading}
      >
        {loading ? "Processing..." : isClockedIn ? "Time Out" : "Time In"}
      </Button>
    </div>
  );
}
