"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { InfoSidebar } from "@/components/InfoSidebar";
import { EvaluatorDashboard } from "@/components/EvaluatorDashboard";

export default function Home() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <main className="flex flex-col h-screen overflow-hidden bg-bg-primary">
      <TopBar infoOpen={infoOpen} onToggleInfo={() => setInfoOpen(!infoOpen)} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <InfoSidebar open={infoOpen} onClose={() => setInfoOpen(false)} />

        <div className="flex-1 min-h-0 overflow-hidden">
          <EvaluatorDashboard />
        </div>
      </div>
    </main>
  );
}
