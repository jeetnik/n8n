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
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "webhook":
        return "bg-green-100 text-green-700 border-green-200";
      case "schedule":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const triggers = useWorkflowStore((state) => state.triggers);

  const addTriggerNode = useWorkflowStore((state) => state.addTriggerNode);
  const handleTriggerSelect = (trigger: TriggerI) => {
    addTriggerNode(trigger);
    setIsOpen(false);
  };

  return (
    <div className="bg-teal-50 border border-dashed py-4 border-teal-400 rounded-lg shadow-md flex flex-col items-center justify-center gap-2 w-20">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="cursor-pointer w-[60px] px-2 py-1 text-[10px] rounded-sm bg-teal-500 hover:bg-teal-600 text-white transition-all duration-200 shadow">
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
                  className="group mx-4 p-2 border border-gray-200 rounded-lg hover:border-teal-300 hover:shadow-md cursor-pointer transition-all duration-200 bg-white hover:bg-teal-50"
                  onClick={() => handleTriggerSelect(trigger)}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-1">
                      {getTriggerIcon(trigger.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                          {trigger.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadgeColor(trigger.type)}`}
                        >
                          {trigger.type?.toUpperCase()}
                        </span>
                      </div>

                      {trigger.description && (
                        <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-relaxed">
                          {trigger.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 pt-1 border-t border-transparent group-hover:border-teal-200 transition-all duration-200">
                    <span className="text-xs text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Click to add this trigger
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 font-medium">
                  No triggers available
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Triggers will appear here when loaded
                </p>
              </div>
            )}
          </div>

          <SheetFooter className="mt-6 border-t">
            <SheetClose asChild>
              <Button className="bg-teal-900 w-full sm:w-auto">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
