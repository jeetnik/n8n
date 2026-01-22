"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, Position } from "@xyflow/react";
import { Webhook, Settings, Trash, Copy } from "lucide-react";
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
import { BACKEND_URL } from "@/app/config/api";
import { toast } from "sonner";

export function WebhookTriggerNode({ data, id }: { data: any, id: string }) {
  const [webhookName, setWebhookName] = useState<string>(data?.webhookName || "");
  const [isOpen, setIsOpen] = useState(false);
  const { workflowId } = useWorkflowStore();

  const webhookUrl = workflowId
    ? `${BACKEND_URL}/api/v1/webhook/${workflowId}/${id}`
    : `${BACKEND_URL}/api/v1/webhook/[WORKFLOW_ID]/${id}`;

  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const isUrlReady = Boolean(workflowId);

  useEffect(() => {
    if (data?.autoOpen && !data?.configured) {
      setIsOpen(true);
      updateNodeData(id, { autoOpen: false });
    }
  }, [data?.autoOpen, data?.configured, id, updateNodeData]);

  const handleSave = () => {
    if (!webhookName.trim()) {
      toast.warning("Please enter webhook name");
      return;
    }
    updateNodeData(id, {
      webhookName: webhookName.trim(),
      webhookUrl,
      configured: true
    });
    setIsOpen(false);
  };

  const copyUrl = () => {
    if (!isUrlReady) {
      toast.info("Please save workflow first");
      return;
    }
    navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied to clipboard");
  };

  return (
    <div className="border border-l rounded-l-3xl bg-cyan-900 relative">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Settings className="absolute opacity-80 w-3 h-3 -top-2 bg-neutral-100 text-black rounded-full right-0 cursor-pointer p-0.5" />
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Configure Webhook Trigger</DialogTitle>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Webhook Name
              </label>
              <Input
                value={webhookName}
                onChange={(e) => setWebhookName(e.target.value)}
                placeholder="Enter webhook name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Webhook URL</label>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  readOnly
                  className={isUrlReady ? "bg-green-50" : "bg-yellow-50"}
                />
                <Button size="sm" onClick={copyUrl} disabled={!isUrlReady}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {!isUrlReady && (
                <p className="text-amber-600 text-xs mt-1">
                  Save workflow first to generate URL
                </p>
              )}
            </div>
          </div>
          <Button onClick={handleSave}>Save</Button>
        </DialogContent>
      </Dialog>

      <Trash
        className="absolute w-3 h-3 -top-2 bg-neutral-100 text-black rounded-full right-4 cursor-pointer p-0.5 hover:bg-red-100"
        onClick={() => deleteNode(id)}
      />

      <div className="p-4 text-center">
        <Webhook className="w-6 h-6 text-white mx-auto mb-2" />
        <div className="text-white text-xs">
          {data?.webhookName || "Webhook"}
        </div>
        {data?.configured && (
          <div className="text-green-200 text-xs mt-1">Configured</div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-300 border-2 border-green-500"
      />
    </div>
  );
}
