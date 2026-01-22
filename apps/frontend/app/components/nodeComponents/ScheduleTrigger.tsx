"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, Position } from "@xyflow/react";
import { Clock, Settings, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { useWorkflowStore } from "@/app/store/workflowStore";
import { toast } from "sonner";

export function ScheduledTriggerNode({ data, id }: { data: any; id: string }) {
  const [cronExpression, setCronExpression] = useState<string>(data?.cronExpression || "");
  const [isOpen, setIsOpen] = useState(false);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  useEffect(() => {
    if (data?.autoOpen && !data?.configured) {
      setIsOpen(true);
      updateNodeData(id, { autoOpen: false });
    }
  }, [data?.autoOpen, data?.configured, id, updateNodeData]);

  // Sync state with node data ONLY when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCronExpression(data?.cronExpression || "");
    }
  }, [isOpen, data?.cronExpression]);
  // Auto-save changes to store with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update if values are different and valid
      if (cronExpression !== data?.cronExpression && cronExpression) {
        updateNodeData(id, {
          cronExpression: cronExpression.trim(),
          configured: !!cronExpression
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cronExpression, id, updateNodeData, data?.cronExpression]);

  const handleSave = () => {
    if (!cronExpression.trim()) {
      toast.warning("Please enter cron expression");
      return;
    }

    // Basic cron validation
    const parts = cronExpression.trim().split(" ");
    if (parts.length < 5 || parts.length > 6) {
      toast.error("Invalid cron expression. Use format: * * * * * or * * * * * *");
      return;
    }

    updateNodeData(id, {
      cronExpression: cronExpression.trim(),
      configured: true,
    });

    toast.success("Schedule configured successfully");
    setIsOpen(false);
  };

  const cronPresets = [
    { label: "Every minute", value: "* * * * *" },
    { label: "Every 5 minutes", value: "*/5 * * * *" },
    { label: "Every hour", value: "0 * * * *" },
    { label: "Every day at midnight", value: "0 0 * * *" },
    { label: "Every day at 9 AM", value: "0 9 * * *" },
    { label: "Every Monday at 9 AM", value: "0 9 * * 1" },
  ];

  return (
    <div className="bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg border-2 border-purple-400 relative">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Settings className="absolute opacity-80 w-3 h-3 -top-2 bg-neutral-100 text-black rounded-full right-0 cursor-pointer p-0.5" />
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogTitle>Configure Schedule Trigger</DialogTitle>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Cron Expression</label>
              <Input
                placeholder="* * * * *"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                className="mt-1 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: minute hour day month weekday
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Quick Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {cronPresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    onClick={() => setCronExpression(preset.value)}
                    className={`text-xs ${cronExpression === preset.value ? 'bg-teal-100 border-teal-400 hover:bg-teal-200' : ''}`}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-md text-sm">
              <div className="font-semibold text-blue-900 mb-1">Cron Help:</div>
              <div className="text-blue-800 space-y-1">
                <div>* * * * * = minute hour day month weekday</div>
                <div>* = every</div>
                <div>*/5 = every 5</div>
                <div>0-5 = range from 0 to 5</div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={handleSave}>Save Configuration</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Trash
        className="absolute w-3 h-3 -top-2 bg-neutral-100 text-black rounded-full right-4 cursor-pointer p-0.5 hover:bg-red-100"
        onClick={() => deleteNode(id)}
      />

      <div className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
        <div className="text-xs truncate" title={data.label}>
          {data.label}
        </div>
        <div className="flex justify-center items-center mt-1">
          <Clock className="w-6 h-6" />
        </div>
        {data?.cronExpression && (
          <div className="text-[10px] mt-1 opacity-80 font-mono truncate">
            {data.cronExpression}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-purple-300 border-2 border-purple-500"
      />
    </div>
  );
}
