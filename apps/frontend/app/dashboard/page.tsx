"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { DashboardTabs } from "@/app/components/DashboardTabs";
import { useWorkflowStore } from "@/app/store/workflowStore";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

function DashboardContent() {
  const resetWorkflow = useWorkflowStore((state) => state.resetWorkflow);

  // Reset workflow on mount
  useEffect(() => {
    resetWorkflow();
  }, [resetWorkflow]);

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="w-full flex items-center justify-between px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 rounded bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
          <h2 className="text-xl font-semibold text-white">
            Dashboard
          </h2>
        </div>
      </div>
      <Suspense fallback={<div className="p-4 text-gray-400">Loading tabs...</div>}>
        <DashboardTabs />
      </Suspense>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}