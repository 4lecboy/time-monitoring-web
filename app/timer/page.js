"use client";
import { useEffect, useState, useRef } from "react";

export default function TimeMonitoringPage() {
  const tasks = ['Voice', 'Email', 'Data', 'Chat', 'Support'];
  const [timers, setTimers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const localStorageKey = 'time-monitoring-data';

  // Function to save timers to localStorage
  const saveToLocalStorage = (timerData) => {
    try {
      const dataToSave = {
        timers: timerData,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(localStorageKey, JSON.stringify(dataToSave));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  };

  // Function to load timers from localStorage
  const loadFromLocalStorage = () => {
    try {
      const storedData = localStorage.getItem(localStorageKey);
      if (!storedData) return null;
      
      const parsedData = JSON.parse(storedData);
      const lastUpdated = new Date(parsedData.lastUpdated);
      const now = new Date();
      const secondsElapsed = Math.floor((now - lastUpdated) / 1000);
      
      // Update any running timer with elapsed time
      const updatedTimers = { ...parsedData.timers };
      Object.keys(updatedTimers).forEach(task => {
        if (updatedTimers[task].started) {
          updatedTimers[task].time += secondsElapsed;
        }
      });
      
      return updatedTimers;
    } catch (err) {
      console.error('Error loading from localStorage:', err);
      return null;
    }
  };

  // Function to fetch timer data from the server
  const fetchTimers = async () => {
    try {
      const response = await fetch('/api/timers');
      if (!response.ok) throw new Error('Failed to fetch timers');
      
      const data = await response.json();
      
      // Convert array to object format
      const timerObject = {};
      data.forEach(timer => {
        timerObject[timer.task] = { 
          time: timer.time_seconds, 
          started: Boolean(timer.started),
          lastUpdated: timer.last_updated
        };
      });
      
      return timerObject;
    } catch (err) {
      console.error('Error fetching timers:', err);
      throw err;
    }
  };

  // Initialize app - load from both sources and reconcile
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      try {
        // Try to get data from localStorage first for immediate display
        const localData = loadFromLocalStorage();
        if (localData) {
          setTimers(localData);
        }
        
        // Then fetch from database
        const dbData = await fetchTimers();
        
        // Merge data, preferring the higher time value for each timer
        // and preserving active status from the database (source of truth for active status)
        const mergedData = { ...dbData };
        if (localData) {
          Object.keys(mergedData).forEach(task => {
            // If local time is higher, use it (but keep active status from DB)
            if (localData[task] && localData[task].time > mergedData[task].time) {
              mergedData[task] = { 
                ...mergedData[task], 
                time: localData[task].time 
              };
            }
          });
        }
        
        setTimers(mergedData);
        saveToLocalStorage(mergedData); // Save the reconciled data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    initApp();
    
    // Clean up intervals on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  // Set up timer tick and sync intervals
  useEffect(() => {
    if (loading || !Object.keys(timers).length) return;

    // Clear any existing intervals
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);

    // Update timers every second
    intervalRef.current = setInterval(() => {
      setTimers(prevTimers => {
        const newTimers = { ...prevTimers };
        let updated = false;
        
        Object.keys(newTimers).forEach(task => {
          if (newTimers[task].started) {
            newTimers[task] = {
              ...newTimers[task],
              time: newTimers[task].time + 1
            };
            updated = true;
          }
        });
        
        // Only save to localStorage if something changed
        if (updated) {
          saveToLocalStorage(newTimers);
        }
        
        return newTimers;
      });
    }, 1000);

    // Sync with database every 5 seconds
    syncIntervalRef.current = setInterval(async () => {
      // Find any running timer
      const runningTask = Object.entries(timers).find(([_, data]) => data.started);
      if (runningTask) {
        const [task, data] = runningTask;
        await syncTimerToDatabase(task, data.time);
      }
    }, 5000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(syncIntervalRef.current);
    };
  }, [loading, timers]);

  // Create a function to handle before unload to save final state
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save current state to localStorage before page unloads
      saveToLocalStorage(timers);
      
      // If we have an active timer, try to sync it to the database
      const activeTask = Object.entries(timers).find(([_, data]) => data.started);
      if (activeTask) {
        const [task, data] = activeTask;
        // Use sendBeacon for more reliable data sending during page unload
        const blob = new Blob(
          [JSON.stringify({ task, time: data.time })], 
          { type: 'application/json' }
        );
        navigator.sendBeacon('/api/timers', blob);
      }
    };

    // Add the event listener
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [timers]);

  // Sync timer data to the database
  const syncTimerToDatabase = async (task, time) => {
    try {
      await fetch('/api/timers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, time }),
      });
    } catch (err) {
      console.error('Failed to sync timer:', err);
    }
  };

  // Switch to a different timer
  const switchToTimer = async (newTask) => {
    try {
      // Find current active task if any
      const currentActiveEntry = Object.entries(timers).find(
        ([_, data]) => data.started
      );
      
      let previousTask = null;
      let previousTime = null;
      
      if (currentActiveEntry) {
        [previousTask, { time: previousTime }] = currentActiveEntry;
      }

      // Update timer state locally first for responsive UI
      setTimers(prevTimers => {
        const newTimers = { ...prevTimers };
        
        // Mark all timers as not started
        Object.keys(newTimers).forEach(task => {
          newTimers[task] = { ...newTimers[task], started: false };
        });
        
        // Mark the new task as started
        newTimers[newTask] = { ...newTimers[newTask], started: true };
        
        // Save to localStorage immediately
        saveToLocalStorage(newTimers);
        
        return newTimers;
      });

      // Then update in database
      const response = await fetch('/api/timers/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          task: newTask,
          previousTask,
          previousTime 
        }),
      });

      if (!response.ok) throw new Error('Failed to switch timer');
      
    } catch (err) {
      console.error('Error switching timer:', err);
      // If there was an error, reload from the database to get the correct state
      try {
        const dbData = await fetchTimers();
        setTimers(dbData);
        saveToLocalStorage(dbData);
      } catch (syncErr) {
        console.error('Failed to resync after error:', syncErr);
      }
    }
  };

  // Format seconds as HH:MM:SS
  const formatTime = (seconds) => {
    if (seconds === undefined) return "00:00:00";
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  if (loading) return <div className="p-4">Loading timer data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Time Monitoring</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div key={task} className={`p-4 border rounded-lg shadow-md ${timers[task]?.started ? 'bg-blue-50 border-blue-200' : ''}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{task}</h2>
              <div className="text-xl font-mono">
                {formatTime(timers[task]?.time)}
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => switchToTimer(task)}
                disabled={timers[task]?.started}
                className={`px-4 py-2 rounded ${
                  timers[task]?.started 
                    ? 'bg-blue-300 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {timers[task]?.started ? `${task} Active` : `Switch to ${task}`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}