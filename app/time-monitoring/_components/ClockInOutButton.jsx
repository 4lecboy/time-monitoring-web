"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-hot-toast";
import clsx from "clsx";

export default function ClockInOutButton({ ashima_id, isClockedIn, setIsClockedIn }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ashima_id) return;

    axios.get(`/api/time-tracking/clock-status?ashima_id=${ashima_id}`)
      .then((res) => setIsClockedIn(res.data.isClockedIn))
      .catch((error) => {
        console.error("Error checking clock status:", error.response?.data || error.message);
        setIsClockedIn(false);
      });
  }, [ashima_id, setIsClockedIn]);

  const handleClockAction = async (action) => {
    if (loading) return;
  
    if (action === "clock-out") {
      const confirmLogout = window.confirm("Are you sure you want to clock out?");
      if (!confirmLogout) return;
    }
  
    console.log("Sending request:", { ashima_id, logout_by: ashima_id });
  
    setLoading(true);
    try {
      const res = await axios.post(`/api/time-tracking/${action}`, { ashima_id, logout_by: ashima_id });
      console.log("API Response:", res.data);
      
      setIsClockedIn((prev) => !prev);
      toast.success(`Successfully clocked ${action === "clock-in" ? "in" : "out"}!`);
    } catch (error) {
      console.error("Clock action failed:", error);
      console.error("Response data:", error.response?.data || "No error details provided");
  
      toast.error(error.response?.data?.error || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };
  
  
  

  return (
    <div className="text-center mt-4">
      <Button
        onClick={() => handleClockAction(isClockedIn ? "clock-out" : "clock-in")}
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
