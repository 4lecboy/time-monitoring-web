"use client";
import { useState, useEffect } from "react";

export default function Timers({ timers }) {
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="grid grid-cols-5 gap-2 text-center mt-6">
      {Object.keys(timers).map((key) => (
        <div key={key} className="text-lg font-bold">
          <p>{key}</p>
          <p className="border border-gray-400 px-3 py-1">{formatTime(timers[key])}</p>
        </div>
      ))}
    </div>
  );
}
