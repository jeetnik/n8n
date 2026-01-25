"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet";
import { Button } from "@/app/components/ui/button";
import { useState } from "react";
import { Zap, Webhook, Clock, Hand } from "lucide-react";
import { useWorkflowStore, type TriggerI } from "@/app/store/workflowStore";

export interface AddTriggerNodeData {
  label: string;
}

export function AddTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  const getTriggerIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "manual":
        return <Hand className="w-5 h-5 text-blue-600" />;
      case "webhook":
        return <Webhook className="w-5 h-5 text-green-600" />;
      case "schedule":
        return <Clock className="w-5 h-5 text-purple-600" />;
      default:
        return <Zap className="w-5 h-5 text-gray-600" />;
    }
  };
  const getTypeBadgeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "manual":
        return "bg-blue-900/30 text-blue-300 border-blue-800/50";
      case "webhook":
        return "bg-green-900/30 text-green-300 border-green-800/50";
      case "schedule":
        return "bg-purple-900/30 text-purple-300 border-purple-800/50";
      default:
        return "bg-white/10 text-gray-300 border-white/20";
    }
  };

  const triggers = useWorkflowStore((state) => state.triggers);

  const addTriggerNode = useWorkflowStore((state) => state.addTriggerNode);
  const handleTriggerSelect = (trigger: TriggerI) => {
    addTriggerNode(trigger);
    setIsOpen(false);
  };

  return (
    <div className="bg-orange-50 border border-dashed py-4 border-orange-400 rounded-lg shadow-md flex flex-col items-center justify-center gap-2 w-20 cursor-grab active:cursor-grabbing">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="cursor-pointer w-[60px] px-2 py-1 text-[10px] rounded-sm bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200 shadow">
            Trigger
          </button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-1">
              Available Triggers
            </SheetTitle>
            <SheetDescription>
              Select a trigger to start your workflow. Each trigger responds to
              different events.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-2 mt-2 max-h-[70vh] overflow-y-auto">
            {triggers && triggers.length > 0 ? (
              triggers.map((trigger, idx) => (
                <div
                  key={trigger.id || idx}
                  className="group mx-4 p-2 border border-white/20 rounded-lg hover:border-white/30 hover:shadow-md cursor-pointer transition-all duration-200 bg-white/5 hover:bg-white/10"
                  onClick={() => handleTriggerSelect(trigger)}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-1">
                      {getTriggerIcon(trigger.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-white group-hover:text-gray-200 transition-colors">
                          {trigger.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadgeColor(trigger.type)}`}
                        >
                          {trigger.type?.toUpperCase()}
                        </span>
                      </div>

                      {trigger.description && (
                        <p className="text-sm text-gray-400 group-hover:text-gray-300 leading-relaxed">
                          {trigger.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 pt-1 border-t border-transparent group-hover:border-white/20 transition-all duration-200">
                    <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Click to add this trigger
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 font-medium">
                  No triggers available
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Triggers will appear here when loaded
                </p>
              </div>
            )}
          </div>

          <SheetFooter className="mt-6 border-t border-white/10">
            <SheetClose asChild>
              <Button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white w-full sm:w-auto">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
