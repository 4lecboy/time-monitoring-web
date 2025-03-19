'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // ✅ Import useSession
import ClockCard from "./_components/ClockCard";
import TaskButtons from "./_components/TaskButtons";

export default function TimeMonitoringSystem() {
  const { data: session } = useSession();
  const userId = session?.user?.id; // ✅ Get dynamic user ID
  const [sessionId, setSessionId] = useState(null);

  // Fetch session ID dynamically
  useEffect(() => {
    const fetchSession = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(`/api/sessions?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch session ID");
        
        const data = await response.json();
        setSessionId(data.sessionId); // ✅ Set real session ID
      } catch (error) {
        console.error("Error fetching session ID:", error);
      }
    };

    fetchSession();
  }, [userId]); // Runs when userId changes

  return (
    <div className="flex flex-col items-center p-6 space-y-6 bg-gray-100 min-h-screen">
      <ClockCard />
      {userId && sessionId ? (
        <TaskButtons userId={userId} sessionId={sessionId} />
      ) : (
        <p>Loading session...</p> // Shows a message while fetching sessionId
      )}
    </div>
  );
}
