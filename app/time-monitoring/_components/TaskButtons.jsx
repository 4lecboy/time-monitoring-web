"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const tasks = ["Voice", "Email", "Data", "Chat", "Support"];

export default function TaskButtons({ ashima_id, updateTimers }) {
  const [activeTask, setActiveTask] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const handleTaskClick = async (task) => {
    if (activeTask === task) {
      const endTime = new Date();
      const taskDuration = Math.floor((endTime - startTime) / 1000);
      const formattedTime = new Date(taskDuration * 1000).toISOString().substr(11, 8);

      try {
        await axios.post("/api/time-tracking/task", {
          ashima_id,
          task_type: task,
          task_time: formattedTime,
        });
        toast.success(`${task} task recorded`);
        updateTimers(task, taskDuration);
      } catch (error) {
        toast.error("Failed to log task");
      }

      setActiveTask(null);
      setStartTime(null);
    } else {
      setActiveTask(task);
      setStartTime(new Date());
    }
  };

  return (
    <div className="flex gap-2">
      {tasks.map((task) => (
        <Button
          key={task}
          onClick={() => handleTaskClick(task)}
          className={`${activeTask === task ? "bg-blue-600" : "bg-green-600"}`}
        >
          {task}
        </Button>
      ))}
    </div>
  );
}
