"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type FitViewOptions,
  type OnNodeDrag,
  type DefaultEdgeOptions,
  Controls,
  Background,
  MiniMap,
  ControlButton,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AddTrigger } from "@/app/components/AddTrigger";
import { ManualTriggerNode } from "@/app/components/nodeComponents/ManualTriggerNode";
import { ScheduledTriggerNode } from "@/app/components/nodeComponents/ScheduleTrigger";
import { WebhookTriggerNode } from "@/app/components/nodeComponents/WebhookTrigger";
import { CreateWorkflowNavbar } from "@/app/components/CreateWorkflowNavbar";
import { useWorkflowStore } from "@/app/store/workflowStore";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};
const onNodeDrag: OnNodeDrag = (_, node) => {
  console.log("drag event", node.data);
};
const nodeTypes = {
  addTrigger: AddTrigger,
  manualTrigger: ManualTriggerNode,
  scheduleTrigger: ScheduledTriggerNode,
  webhookTrigger: WebhookTriggerNode,
};

const CreateWorkflowContent = () => {
  const router = useRouter();
  const { screenToFlowPosition } = useReactFlow();

  const getViewportCenter = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    return screenToFlowPosition({ x: centerX, y: centerY });
  };

  const {
    nodes,
    edges,
    isWorkflowActive,
    projectName,
    onNodesChange,
    onEdgesChange,
    onConnect,
    saveWorkflow,
    setIsWorkflowActive,
    setProjectName,
    loadTriggers,
    loadUserCredentials,
    isSaving,
    resetWorkflow,
  } = useWorkflowStore();

  useEffect(() => {
    resetWorkflow();
    loadTriggers();
    loadUserCredentials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      const workflowId = await saveWorkflow();
      if (workflowId) {
        router.push(`/workflow/${workflowId}`);
      }
    } catch (error) {
      console.error("Error saving workflow:", error);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col">
      <CreateWorkflowNavbar
        projectName={projectName}
        isActive={isWorkflowActive}
        onSave={handleSave}
        onActiveToggle={setIsWorkflowActive}
        onNameChange={setProjectName}
        isSaving={isSaving}
        getViewportCenter={getViewportCenter}
      />
      <div className="flex-1">
        <ReactFlow
          className="h-full w-full"
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDrag={onNodeDrag}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={fitViewOptions}
          defaultEdgeOptions={defaultEdgeOptions}
        >
          <Controls>
            <ControlButton
              onClick={() => { }}
            />
          </Controls>
          <Background />
          <MiniMap nodeStrokeWidth={3} />
        </ReactFlow>
      </div>
    </div>
  );
};

function CreateWorkflowPage() {
  return (
    <ReactFlowProvider>
      <CreateWorkflowContent />
    </ReactFlowProvider>
  );
}

export default function CreatePage() {
  return (
    <ProtectedRoute>
      <CreateWorkflowPage />
    </ProtectedRoute>
  );
}
