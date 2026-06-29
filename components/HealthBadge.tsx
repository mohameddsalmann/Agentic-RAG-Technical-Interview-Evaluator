"use client";

import { useEffect, useState } from "react";
import { checkHealth } from "@/lib/api";
import type { HealthResponse } from "@/types";

export function HealthBadge() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function poll() {
      try {
        const h = await checkHealth();
        if (mounted) {
          setHealth(h);
          setError(false);
        }
      } catch {
        if (mounted) setError(true);
      }
    }

    poll();
    const interval = setInterval(poll, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const isDemo = health?.mode === "demo";
  const isOk = !error && health?.status === "ok";

  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <span
        className={`w-2 h-2 rounded-full ${
          isOk ? (isDemo ? "bg-warning" : "bg-success") : "bg-danger"
        }`}
        aria-hidden="true"
      />
      <span className="text-muted">
        {error ? "offline" : isDemo ? "demo mode" : "production"}
      </span>
      {health?.model && (
        <span className="text-muted/60 hidden sm:inline">· {health.model}</span>
      )}
    </div>
  );
}
