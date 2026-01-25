"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { Save, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/app/components/ui/dialog";
import { ActionForm, availableActions, type ActionI } from "@/app/lib/Actions";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useWorkflowStore } from "@/app/store/workflowStore";

interface WorkflowNavbarProps {
  projectName?: string;
  isActive?: boolean;
  onSave?: () => void;
  onActiveToggle?: (active: boolean) => void;
  onNameChange?: (newName: string) => void;
  isSaving?: boolean;
  isViewMode?: boolean;
  getViewportCenter?: () => { x: number; y: number };
}

export function WorkflowNavbar({
  projectName = "My Project Name",
  isActive = false,
  onSave,
  onActiveToggle,
  onNameChange,
  isSaving = false,
  isViewMode = false,
  getViewportCenter,
}: WorkflowNavbarProps) {
  const [dialogState, setDialogState] = useState("actions");
  const [selectedAction, setSelectedAction] = useState<ActionI | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(projectName);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    executeWorkflowWithWebSocket,
    isExecuting,
    disconnectWebSocket,

  } = useWorkflowStore();

  const addActionNode = useWorkflowStore((state) => state.addActionNode);

  const handleActionSelect = (action: ActionI) => {
    setSelectedAction(action);
    setDialogState("form");
  };

  const handleBackToActions = () => {
    setDialogState("actions");
    setSelectedAction(null);
  };

  const handleFormSubmit = (data: {
    action: ActionI;
    formData: any;
    credentials: any;
    metadata: any;
  }) => {
    console.log("Form submitted:", data);

    const position = getViewportCenter?.();
    addActionNode({
      name: data.action.name,
      type: data.action.type,
      application: data.action.application,
      parameters: data.formData,
      credentials: data.credentials,
      metadata: data.metadata,
      actionDefinition: data.action,
    }, position);

    setDialogState("actions");
    setSelectedAction(null);
    setIsDialogOpen(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setDialogState("actions");
      setSelectedAction(null);
    }
  };

  const handleExecution = async () => {
    try {
      await executeWorkflowWithWebSocket();
    } catch (err) {
      console.log("Error is execution", err);
    }
  };

  const handleNameClick = () => {
    setIsEditingName(true);
    setEditedName(projectName);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (editedName.trim() && editedName !== projectName) {
      onNameChange?.(editedName.trim());
    } else {
      setEditedName(projectName);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setEditedName(projectName);
      setIsEditingName(false);
    }
  };

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    setEditedName(projectName);
  }, [projectName]);

  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  return (
    <nav className="w-full flex items-center justify-between py-4 px-3 mt-1 border-b border-white/10 bg-black">
      <div className="flex items-center gap-2">
        <div className="h-5 w-1 rounded bg-white/20"></div>
        {isEditingName ? (
          <input
            ref={inputRef}
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="text-xl font-semibold text-white bg-transparent border-b-2 border-white/30 focus:outline-none px-1 min-w-[200px]"
          />
        ) : (
          <h2
            className="text-xl font-semibold text-white cursor-pointer hover:text-gray-300 transition-colors"
            onClick={handleNameClick}
          >
            {projectName}
          </h2>
        )}
        {isViewMode && (
          <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
            Saved
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300 hidden sm:inline">
            Active
          </span>
          <Switch
            checked={isActive}
            onCheckedChange={onActiveToggle}
            className="data-[state=checked]:bg-white/20"
          />
          <span className="text-xs text-gray-400 sm:hidden">
            {isActive ? "On" : "Off"}
          </span>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-white/10 text-white cursor-pointer border border-white/20 hover:bg-white/20 rounded-lg">
              Add Action
            </Button>
          </DialogTrigger>

          <DialogContent>
            {dialogState === "actions" && (
              <div className="flex flex-col max-h-[50vh] overflow-scroll">
                <DialogTitle className="font-semibold text-white text-lg mb-2">
                  Select the Action
                </DialogTitle>
                {availableActions.map((action) => {
                  return (
                    <div className="ml-5" key={action.id}>
                      <div
                        onClick={() => handleActionSelect(action)}
                        className="flex cursor-pointer bg-white/5 items-center w-[90%] gap-2 py-1 my-1 px-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors text-white"
                      >
                        <span>{action.icon}</span>
                        <div>{action.name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {dialogState === "form" && selectedAction && (
              <ActionForm
                action={selectedAction}
                onBack={handleBackToActions}
                onSubmit={handleFormSubmit}
              />
            )}
          </DialogContent>
        </Dialog>

        <Button
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 sm:px-4 py-2 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          onClick={handleExecution}
          disabled={isExecuting}
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running...
            </>
          ) : (
            "Run"
          )}
        </Button>

        <Button
          onClick={onSave}
          disabled={isSaving}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 sm:px-4 py-2 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isSaving
              ? isViewMode
                ? "Updating..."
                : "Saving..."
              : isViewMode
                ? "Update"
                : "Save"}
          </span>
        </Button>
      </div>
    </nav>
  );
}
