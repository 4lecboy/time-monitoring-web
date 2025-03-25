"use client";
import { useState } from "react";
import { useSession } from "next-auth/react"; // ✅ Import useSession
import Clock from "./_components/Clock";
import TaskButtons from "./_components/TaskButtons";
import ActivityButtons from "./_components/ActivityButtons";
import Timers from "./_components/Timer";
import ClockInOutButton from "./_components/ClockInOutButton";

export default function TimeMonitoringPage() {
  const { data: session, status } = useSession(); // ✅ Always call hooks at the top!

  const [timers, setTimers] = useState({
    StaffHrs: 0,
    Break1: 0,
    Lunch: 0,
    Break2: 0,
    RestRoom: 0,
    Coaching: 0,
    Training: 0,
    Meeting: 0,
    Technical: 0,
  });

  const updateTimers = (key, duration) => {
    setTimers((prev) => ({
      ...prev,
      [key]: prev[key] + duration,
    }));
  };

  if (status === "loading") return <p>Loading...</p>; // ✅ Keep outside of hooks
  if (!session?.user) return <p>You must be logged in.</p>;

  const ashima_id = session.user.ashima_id; // ✅ Always define variables AFTER hooks

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Time Monitoring</h1>

      {/* Clock Display */}
      <div className="flex justify-center mb-6">
        <Clock />
      </div>

      {/* Clock In/Out Button */}
      <ClockInOutButton ashima_id={ashima_id} />

      {/* Timers */}
      <Timers timers={timers} />

      <div className="flex justify-between mt-4">
        <TaskButtons ashima_id={ashima_id} updateTimers={updateTimers} />
        <ActivityButtons ashima_id={ashima_id} updateTimers={updateTimers} />
      </div>
    </div>
  );
}
