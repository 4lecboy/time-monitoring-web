"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TimeMonitoringPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session || session.user.role !== "agent") {
      router.push("/unauthorized");
    }
  }, [session]);

  return <h1>Time Monitoring Page</h1>;
}
