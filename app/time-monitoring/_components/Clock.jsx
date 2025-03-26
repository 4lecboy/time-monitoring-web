"use client";
import { useState, useEffect } from "react";

export default function Clock() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };

    updateClock(); // Set initial time
    const interval = setInterval(updateClock, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-6xl font-bold text-gray-700">
      {currentTime || "Loading..."}
    </div>
  );
}
