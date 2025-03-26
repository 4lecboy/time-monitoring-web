"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const auxActivities = ["Break 1", "Lunch", "Break 2", "Rest Room", "Coaching", "Training", "Meeting", "Technical"];

export default function AuxManager({ isClockedIn, activeTask, setActiveTask, activeAux, setActiveAux }) {
  const [auxTime, setAuxTime] = useState(0);
  const [auxTimers, setAuxTimers] = useState({});

  useEffect(() => {
    let interval;
    if (isClockedIn && activeAux && !activeTask) {
      interval = setInterval(() => {
        setAuxTime((prev) => prev + 1);
        setAuxTimers((prevTimers) => ({
          ...prevTimers,
          [activeAux]: (prevTimers[activeAux] || 0) + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClockedIn, activeAux, activeTask]);

  const handleAuxClick = (activity) => {
    if (!isClockedIn) {
      toast.error("You must clock in first!");
      return;
    }

    if (activeAux !== activity) {
      setActiveAux(activity);
      setActiveTask(null); // ✅ Stop any running task timer
      toast.success(`Switched to: ${activity}`);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2">Non-Work Activities</h2>
      <div className="flex gap-2">
        {auxActivities.map((activity) => (
          <Button
            key={activity}
            disabled={!isClockedIn} // ✅ Prevent clicking if not clocked in
            onClick={() => handleAuxClick(activity)}
            className={`${activeAux === activity ? "bg-orange-600" : "bg-gray-600"} ${
              !isClockedIn ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {activity}
          </Button>
        ))}
      </div>

      {/* Show aux timers */}
      <div className="mt-4 p-4 border rounded-lg shadow-lg bg-white text-center">
        <h3 className="text-lg font-bold">Non-Work Timers</h3>
        {auxActivities.map((activity) => (
          <p key={activity}>
            {activity}: {formatTime(auxTimers[activity] || 0)}
          </p>
        ))}
        <p className="font-bold mt-2">Total Aux Time: {formatTime(auxTime)}</p>
      </div>
    </div>
  );
}
