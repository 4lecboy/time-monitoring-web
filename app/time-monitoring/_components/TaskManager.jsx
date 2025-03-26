"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const tasks = ["Voice", "Email", "Data", "Chat", "Support"];

export default function TaskManager({ isClockedIn, activeAux, setActiveAux, activeTask, setActiveTask }) {
  const [staffHrs, setStaffHrs] = useState(0);
  const [taskTimers, setTaskTimers] = useState({});

  useEffect(() => {
    let interval;
    if (activeTask && !activeAux) {
      interval = setInterval(() => {
        setStaffHrs((prev) => prev + 1);
        setTaskTimers((prevTimers) => ({
          ...prevTimers,
          [activeTask]: (prevTimers[activeTask] || 0) + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTask, activeAux]);

  const handleTaskClick = (task) => {
    if (!isClockedIn) return;
    
    if (activeTask !== task) {
      setActiveTask(task);
      setActiveAux(null); // ✅ Stop any running aux timer
      toast.success(`Switched to task: ${task}`);
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
      <h2 className="text-xl font-bold mb-2">Tasks</h2>
      <div className="flex gap-2">
        {tasks.map((task) => (
          <Button
            disabled={!isClockedIn}
            key={task}
            onClick={() => handleTaskClick(task)}
            className={`${activeTask === task ? "bg-blue-600" : "bg-green-600"}`}
          >
            {task}
          </Button>
        ))}
      </div>

      {/* Show task timers */}
      <div className="mt-4 p-4 border rounded-lg shadow-lg bg-white text-center">
        <h3 className="text-lg font-bold">Task Timers</h3>
        {tasks.map((task) => (
          <p key={task}>
            {task}: {formatTime(taskTimers[task] || 0)}
          </p>
        ))}
        <p className="font-bold mt-2">Total Staff Hours: {formatTime(staffHrs)}</p>
      </div>
    </div>
  );
}
