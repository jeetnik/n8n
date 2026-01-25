"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Switch } from "@/app/components/ui/switch";
import { Save, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/app/components/ui/dialog";
import { ActionForm, availableActions, type ActionI } from "@/app/lib/Actions";
import { useWorkflowStore } from "@/app/store/workflowStore";

interface CreateWorkflowNavbarProps {
  projectName?: string;
  isActive?: boolean;
  onSave?: () => void;
  onActiveToggle?: (active: boolean) => void;
  onNameChange?: (newName: string) => void;
  isSaving?: boolean;
  getViewportCenter?: () => { x: number; y: number };
}

export function CreateWorkflowNavbar({
  projectName = "New Workflow",
  isActive = false,
  onSave,
  onActiveToggle,
  onNameChange,
  isSaving = false,
  getViewportCenter,
}: CreateWorkflowNavbarProps) {
  const [dialogState, setDialogState] = useState("actions");
  const [selectedAction, setSelectedAction] = useState<ActionI | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [dialogName, setDialogName] = useState(projectName);
  const [dialogDescription, setDialogDescription] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(projectName);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get addActionNode from store
  const addActionNode = useWorkflowStore((state) => state.addActionNode);
  const projectDescription = useWorkflowStore((state) => state.projectDescription);
  const setProjectDescription = useWorkflowStore((state) => state.setProjectDescription);

  // Sync dialog states when opening
  useEffect(() => {
    if (isConfirmDialogOpen) {
      setDialogName(projectName);
      setDialogDescription(projectDescription);
    }
  }, [isConfirmDialogOpen, projectName, projectDescription]);

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

        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={isSaving}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isSaving ? "Creating..." : "Create Workflow"}
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Confirm Workflow Creation</DialogTitle>
              <DialogDescription>
                Review and edit your workflow details before creating it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="workflow-name" className="text-sm font-medium text-neutral-700">
                  Workflow Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="workflow-name"
                  value={dialogName}
                  onChange={(e) => setDialogName(e.target.value)}
                  placeholder="Enter workflow name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="workflow-description" className="text-sm font-medium text-neutral-700">
                  Description (Optional)
                </label>
                <textarea
                  id="workflow-description"
                  value={dialogDescription}
                  onChange={(e) => setDialogDescription(e.target.value)}
                  placeholder="Describe what this workflow does..."
                  className="w-full min-h-[100px] px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-neutral-700">Status:</div>
                <div className="text-base">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-neutral-700">Nodes:</div>
                <div className="text-base text-neutral-900">{useWorkflowStore.getState().nodes.length} node(s)</div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  if (dialogName.trim()) {
                    onNameChange?.(dialogName.trim());
                    setProjectDescription(dialogDescription.trim());
                    setIsConfirmDialogOpen(false);
                    onSave?.();
                  }
                }}
                disabled={isSaving || !dialogName.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Confirm & Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
}
