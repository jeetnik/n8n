"use client";

import { Suspense } from "react";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogTrigger } from "@/app/components/ui/dialog";
import type { CredentialsI } from "@nen/db";
import axios from "axios";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/app/config/api";
import { CredentialDialogContent } from "@/app/components/CredentialDialogContent";
import { DashboardTabs } from "@/app/components/DashboardTabs";
import Link from "next/link";
import { useWorkflowStore } from "@/app/store/workflowStore";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

function DashboardContent() {
  const resetWorkflow = useWorkflowStore((state) => state.resetWorkflow);
  const [credApis, setCredApis] = useState<CredentialsI[]>([]);
  const [credName, setCredName] = useState<string>("");
  const [currCredApi, setCredCurrApi] = useState<CredentialsI | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Reset workflow on mount
  useEffect(() => {
    resetWorkflow();
  }, [resetWorkflow]);

  console.log(credApis, credName, currCredApi);

  return (
    <div className=" min-h-screen w-full ">
      <div>
        <div className="w-full flex items-center justify-between px-3 mt-1 border-b ">
          <div className="flex items-center gap-2 ">
            <div className="h-5 w-1 rounded bg-teal-600"></div>
            <h2 className="text-xl font-semibold text-gray-800">
              Dashboard
            </h2>
          </div>{" "}
          <div className="flex gap-1">
            <Link href="/create">
              <Button className='className="px-1 py-1 my-2 mx-2 md:cursor-pointer border-2 border-b-3 border-neutral-800 hover:bg-teal-50 bg-white text-black hover:text-black transition-colors items-center flex rounded-md'>
                Create Workflow
              </Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={async () => {
                    const res = await axios.get(
                      `${BACKEND_URL}/api/v1/cred/apis`,
                      {
                        withCredentials: true,
                      }
                    );
                    setCredApis(res.data.data);
                  }}
                  className="px-2 py-1 my-2 mx-2 md:cursor-pointer border-2 border-b-3 border-neutral-800 hover:bg-teal-50 bg-white text-black hover:text-black transition-colors items-center flex rounded-md"
                >
                  Add Credentials
                </Button>
              </DialogTrigger>

              <CredentialDialogContent
                credApis={credApis}
                credName={credName}
                currCredApi={currCredApi}
                setCredName={setCredName}
                setCredCurrApi={setCredCurrApi}
                onSuccess={() => setIsDialogOpen(false)}
              />
            </Dialog>
          </div>
        </div>
      </div>
      <div>
        <Suspense fallback={<div className="p-4">Loading tabs...</div>}>
          <DashboardTabs />
        </Suspense>
      </div>
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
