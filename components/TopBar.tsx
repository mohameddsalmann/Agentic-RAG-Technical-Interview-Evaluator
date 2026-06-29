"use client";

import { Terminal, HelpCircle } from "lucide-react";
import { HealthBadge } from "./HealthBadge";

interface TopBarProps {
  infoOpen: boolean;
  onToggleInfo: () => void;
}

export function TopBar({ infoOpen, onToggleInfo }: TopBarProps) {
  return (
    <header className="flex items-center justify-between h-14 px-5 border-b border-border bg-bg-card flex-shrink-0 z-30">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-accent" />
          <span className="text-base font-bold text-[#f0f6fc] tracking-tight">
            AI Interview Evaluator
          </span>
        </div>

        <button
          onClick={onToggleInfo}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono border transition-all ${
            infoOpen
              ? "bg-accent/10 border-accent text-accent"
              : "bg-bg-elevated border-border text-muted hover:text-[#f0f6fc] hover:border-accent"
          }`}
          aria-label={infoOpen ? "Close info panel" : "Open info panel"}
          aria-expanded={infoOpen}
        >
          <HelpCircle className="w-4 h-4" />
          <span>How it works</span>
        </button>
      </div>

      <HealthBadge />
    </header>
  );
}
