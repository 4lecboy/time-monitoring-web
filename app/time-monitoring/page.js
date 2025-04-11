"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // shadcn Button component
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"; // shadcn Card component

export default function TimeMonitoringPage() {
  const tasks = ["Voice", "Email", "Data", "Chat", "Support"]; // List of tasks
  const auxActivities = [
    "Break 1",
    "Lunch",
    "Break 2",
    "Rest Room",
    "Coaching",
    "Training",
    "Meeting",
    "Technical",
  ]; // List of auxiliary activities

  const allActivities = [...tasks, ...auxActivities]; // Combine tasks and auxiliary activities

  const [timers, setTimers] = useState(
    allActivities.reduce((acc, activity) => {
      acc[activity] = { time: 0, started: false }; // Initial state for each activity
      return acc;
    }, {})
  );

  const [activeTask, setActiveTask] = useState(null); // Track the currently active activity
  const [totalTaskTime, setTotalTaskTime] = useState(0); // Total time for all main tasks
  const [totalAuxTime, setTotalAuxTime] = useState(0); // Total time for all auxiliary activities

  // Start the timer for a specific activity
  const startTimer = (activity) => {
    // Stop any currently running timer
    if (activeTask && activeTask !== activity) {
      setTimers((prevTimers) => ({
        ...prevTimers,
        [activeTask]: { ...prevTimers[activeTask], started: false },
      }));
    }

    // Start the new timer
    setTimers((prevTimers) => ({
      ...prevTimers,
      [activity]: { ...prevTimers[activity], started: true },
    }));
    setActiveTask(activity); // Set the active activity
  };

  useEffect(() => {
    const intervals = {};

    // Create intervals for the currently active timer
    if (activeTask && timers[activeTask].started) {
      intervals[activeTask] = setInterval(() => {
        setTimers((prevTimers) => ({
          ...prevTimers,
          [activeTask]: {
            ...prevTimers[activeTask],
            time: prevTimers[activeTask].time + 1,
          },
        }));

        // Update total time for tasks or auxiliary activities
        if (tasks.includes(activeTask)) {
          setTotalTaskTime((prevTime) => prevTime + 1);
        } else if (auxActivities.includes(activeTask)) {
          setTotalAuxTime((prevTime) => prevTime + 1);
        }
      }, 1000);
    }

    // Cleanup intervals when component unmounts or activity stops
    return () => {
      Object.keys(intervals).forEach((activity) =>
        clearInterval(intervals[activity])
      );
    };
  }, [activeTask, timers]);

  // Convert seconds to HH:MM:SS format
  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Total Time Section */}
      <Card>
        <CardHeader>
          <CardTitle>Total Time Tracking</CardTitle>
          <CardDescription>Monitor your overall time spent on tasks and activities.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Main Tasks:</h4>
            <p className="text-lg font-semibold">{formatTime(totalTaskTime)}</p>
          </div>
          <div>
            <h4 className="font-medium">Auxiliary Activities:</h4>
            <p className="text-lg font-semibold">{formatTime(totalAuxTime)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Main Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle>Main Tasks</CardTitle>
          <CardDescription>Track time for your primary tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task} className="flex items-center justify-between">
                <span>{task}</span>
                <div className="flex items-center space-x-4">
                  <p className="text-sm">{formatTime(timers[task].time)}</p>
                  <Button
                    onClick={() => startTimer(task)}
                    disabled={timers[task].started}
                  >
                    {timers[task].started ? "Running..." : "Start"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Auxiliary Activities Section */}
      <Card>
        <CardHeader>
          <CardTitle>Auxiliary Activities</CardTitle>
          <CardDescription>Track time for breaks, meetings, and training.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auxActivities.map((activity) => (
              <div key={activity} className="flex items-center justify-between">
                <span>{activity}</span>
                <div className="flex items-center space-x-4">
                  <p className="text-sm">{formatTime(timers[activity].time)}</p>
                  <Button
                    onClick={() => startTimer(activity)}
                    disabled={timers[activity].started}
                  >
                    {timers[activity].started ? "Running..." : "Start"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}