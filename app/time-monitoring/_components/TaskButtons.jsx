'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const TASK_TYPES = ["Voice", "Email", "Data", "Chat", "Support"];

export default function TaskButtons({ userId, sessionId }) {
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActiveTask();
  }, []);

  const fetchActiveTask = async () => {
    try {
      const response = await fetch(`/api/tasks?user_id=${userId}`);
      const data = await response.json();
      if (response.ok && data.id) {
        setActiveTask(data);
      } else {
        setActiveTask(null);
      }
    } catch (error) {
      console.error("Failed to fetch active task:", error);
    }
  };

  const handleTaskClick = async (taskType) => {
    setLoading(true);

    if (activeTask) {
      // End active task
      try {
        const response = await fetch("/api/time-monitoring/tasks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task_id: activeTask.id }),
        });

        const data = await response.json();
        if (response.ok) {
          setActiveTask(null);
        } else {
          console.error("Error:", data.error);
        }
      } catch (error) {
        console.error("Request failed:", error);
      }
    } else {
      // Start new task
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, session_id: sessionId, task_type: taskType }),
        });

        const data = await response.json();
        if (response.ok) {
          fetchActiveTask();
        } else {
          console.error("Error:", data.error);
        }
      } catch (error) {
        console.error("Request failed:", error);
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">
      {TASK_TYPES.map((task) => (
        <Button
          key={task}
          onClick={() => handleTaskClick(task)}
          className={`px-6 py-2 text-white ${activeTask?.task_type === task ? "bg-green-500" : "bg-blue-500"}`}
          disabled={loading}
        >
          {activeTask?.task_type === task ? `Stop ${task}` : `Start ${task}`}
        </Button>
      ))}
    </div>
  );
}
