"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Plus } from "lucide-react";

export function SidebarNavigation() {
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("tab") || "workflows";

    return (
        <div className="w-56 min-h-screen border-r border-white/30 bg-black p-4 flex flex-col">
            {/* Dashboard Title / Logo Header */}
            <div className="flex items-center gap-2 mb-6 px-1">
                <div className="h-6 w-1 bg-teal-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-white">Dashboard</h2>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mb-4">
                <Link href="/create">
                    <Button className="w-full justify-start gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg">
                        <Plus className="h-4 w-4" />
                        Create Workflow
                    </Button>
                </Link>
            </div>

            {/* Divider */}
            <div className="border-t border-white/20 my-2"></div>

            {/* Navigation Links (simulating tabs) */}
            <div className="flex flex-col w-full gap-1">
                <Link
                    href="/dashboard?tab=workflows"
                    className={`w-full justify-start px-4 py-3 text-left rounded-lg transition-colors text-sm font-medium ${currentTab === 'workflows'
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                >
                    WorkFlows
                </Link>
                <Link
                    href="/dashboard?tab=credentials"
                    className={`w-full justify-start px-4 py-3 text-left rounded-lg transition-colors text-sm font-medium ${currentTab === 'credentials'
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                >
                    Credentials
                </Link>
                <Link
                    href="/dashboard?tab=executions"
                    className={`w-full justify-start px-4 py-3 text-left rounded-lg transition-colors text-sm font-medium ${currentTab === 'executions'
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                >
                    Executions
                </Link>
            </div>

            {/* spacer */}
            <div className="flex-1"></div>

            {/* User Avatar Placeholder (bottom) */}
            <div className="mt-auto pt-4 flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 text-xs text-white uppercase font-bold">
                    N
                </div>
            </div>
        </div>
    );
}
