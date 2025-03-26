"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Clock from "./_components/Clock";
import ClockInOutButton from "./_components/ClockInOutButton";
import TaskManager from "./_components/_task/TaskManager";
import AuxManager from "./_components/_aux/AuxManager";



export default function TimeMonitoringPage() {
  const { data: session, status } = useSession();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [activeAux, setActiveAux] = useState(null);

  return (
    <div className="p-5">
      <Clock />
      <ClockInOutButton 
        ashima_id={session?.user?.ashima_id} // ✅ Ensure `ashima_id` is passed correctly
        isClockedIn={isClockedIn} 
        setIsClockedIn={setIsClockedIn} 
        />
      <TaskManager isClockedIn={isClockedIn} activeAux={activeAux} setActiveAux={setActiveAux} />
      <AuxManager activeTask={activeTask} setActiveTask={setActiveTask} />
    </div>
  );
}


