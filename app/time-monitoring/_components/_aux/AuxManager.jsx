"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const auxActivities = ["Break 1", "Lunch", "Break 2", "Rest Room", "Coaching", "Training", "Meeting", "Technical"];

export default function AuxManager({ activeTask, setActiveTask }) {
  const [selectedAux, setSelectedAux] = useState(null);
  const [auxTimers, setAuxTimers] = useState({});
  const [auxTime, setAuxTime] = useState(0);
  const [isAuxRunning, setIsAuxRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isAuxRunning) {
      interval = setInterval(() => {
        setAuxTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAuxRunning]);

  useEffect(() => {
    let interval;
    if (selectedAux) {
      interval = setInterval(() => {
        setAuxTimers((prevTimers) => ({
          ...prevTimers,
          [selectedAux]: (prevTimers[selectedAux] || 0) + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [selectedAux]);

  const handleAuxClick = (activity) => {
    if (selectedAux === activity) {
      setSelectedAux(null);
      setIsAuxRunning(false);
      setActiveTask(null);
      toast.success(`Stopped: ${activity}`);
    } else {
      setSelectedAux(activity);
      setActiveTask(null);
      setIsAuxRunning(true);
      toast.success(`Started: ${activity}`);
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
            disabled={!!activeTask}
            onClick={() => handleAuxClick(activity)}
            className={`${selectedAux === activity ? "bg-orange-600" : "bg-gray-600"} ${
              activeTask ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {activity}
          </Button>
        ))}
      </div>

      {/* Show all aux timers */}
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
