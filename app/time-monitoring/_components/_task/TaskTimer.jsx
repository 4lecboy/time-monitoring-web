"use client";
import { useState, useEffect } from "react";

export default function TaskTimer({ activeTask }) {
  const [taskTimers, setTaskTimers] = useState({});
  const [currentTask, setCurrentTask] = useState(null);

  useEffect(() => {
    let interval;

    if (activeTask) {
      setCurrentTask(activeTask);

      interval = setInterval(() => {
        setTaskTimers((prevTimers) => ({
          ...prevTimers,
          [activeTask]: (prevTimers[activeTask] || 0) + 1, // Start/resume only this task
        }));
      }, 1000);
    }

    return () => clearInterval(interval); // Pause when task changes
  }, [activeTask]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="text-lg font-bold text-center">
      <p className="border border-gray-400 px-3 py-1">
        {formatTime(taskTimers[currentTask] || 0)}
      </p>
    </div>
  );
}
