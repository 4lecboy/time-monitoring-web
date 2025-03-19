'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ClockCard() {
  const [currentTime, setCurrentTime] = useState("");
  const [clockedIn, setClockedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const updateClock = () => setCurrentTime(new Date().toLocaleTimeString());
    updateClock();
    const timer = setInterval(updateClock, 1000);

    fetchClockStatus();

    return () => clearInterval(timer);
  }, []);

  const fetchClockStatus = async () => {
    try {
      const response = await fetch("/api/time-monitoring/time");
      const data = await response.json();

      if (response.ok) {
        const isClockedIn = data.some(record => record.status === "clocked_in" && !record.time_out);
        setClockedIn(isClockedIn);
      } else {
        console.error("Error fetching status:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  const handleClockToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/time-monitoring/time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, action: clockedIn ? "clock_out" : "clock_in" })
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok) {
        await fetchClockStatus();
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold">{currentTime}</h1>
      <Card className="p-4 w-full max-w-md text-center">
        <CardContent>
          <h2 className={`text-2xl font-semibold ${clockedIn ? "text-green-500" : "text-red-500"}`}>
            {clockedIn ? "Clocked In" : "Clocked Out"}
          </h2>
          <Button onClick={handleClockToggle} className="mt-4 w-full" disabled={loading}>
            {loading ? "Processing..." : clockedIn ? "Clock Out" : "Clock In"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
