"use client";

import { useState, useEffect, useCallback } from "react";
import { TopBar } from "./TopBar";
import { InfoSidebar } from "./InfoSidebar";
import { EvaluatorDashboard } from "./EvaluatorDashboard";
import { LandingIntro } from "./LandingIntro";

export function AppShell() {
  const [enteredIde, setEnteredIde] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#ide") {
      setEnteredIde(true);
    }
  }, []);

  useEffect(() => {
    function handleHashChange() {
      setEnteredIde(window.location.hash === "#ide");
    }
    window.addEventListener("popstate", handleHashChange);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("popstate", handleHashChange);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const handleEnterIde = useCallback(() => {
    window.history.pushState(null, "", "#ide");
    setEnteredIde(true);
  }, []);

  return (
    <>
      <InfoSidebar open={infoOpen} onClose={() => setInfoOpen(false)} />
      {!enteredIde ? (
        <LandingIntro
          onEnter={handleEnterIde}
          onShowWorkflow={() => setInfoOpen(true)}
        />
      ) : (
        <div className="flex flex-col h-screen overflow-hidden bg-bg-primary animate-fade-in">
          <TopBar infoOpen={infoOpen} onToggleInfo={() => setInfoOpen(!infoOpen)} />
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-hidden">
              <EvaluatorDashboard />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
