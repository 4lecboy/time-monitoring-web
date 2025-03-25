"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const activities = ["Break1", "Lunch", "Break2", "RestRoom", "Coaching", "Training", "Meeting", "Technical"];

export default function ActivityButtons({ ashima_id, updateTimers }) {
  const [activeActivity, setActiveActivity] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const handleActivityClick = async (activity) => {
    if (activeActivity === activity) {
      const endTime = new Date();
      const activityDuration = Math.floor((endTime - startTime) / 1000);
      const formattedTime = new Date(activityDuration * 1000).toISOString().substr(11, 8);

      try {
        await axios.post("/api/time-tracking/activity", {
          ashima_id,
          activity_type: activity,
          activity_time: formattedTime,
        });
        toast.success(`${activity} recorded`);
        updateTimers(activity, activityDuration);
      } catch (error) {
        toast.error("Failed to log activity");
      }

      setActiveActivity(null);
      setStartTime(null);
    } else {
      setActiveActivity(activity);
      setStartTime(new Date());
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {activities.map((activity) => (
        <Button
          key={activity}
          onClick={() => handleActivityClick(activity)}
          className={`${activeActivity === activity ? "bg-red-600" : "bg-green-600"}`}
        >
          {activity}
        </Button>
      ))}
    </div>
  );
}
