"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
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
import { WorkflowNavbar } from "@/app/components/WorkflowNavbar";
import { useWorkflowStore } from "@/app/store/workflowStore";
import { ActionNode } from "@/app/components/nodeComponents/ActionNode";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

// ye  Node configuration
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
  action: ActionNode,
};

const WorkflowContent = () => {
  const params = useParams();
  const workflowId = params.workflowId as string;
  const { screenToFlowPosition } = useReactFlow();

  const getViewportCenter = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    return screenToFlowPosition({ x: centerX, y: centerY });
  };

  const {
    nodes,
    edges,

    nodeStatuses,
    executionEvents,

    isWorkflowActive,
    projectName,
    onNodesChange,
    onEdgesChange,
    onConnect,
    saveWorkflow,
    setIsWorkflowActive,
    loadWorkflow,
    loadUserCredentials,
    loadTriggers,
    isSaving,
    isLoading,
  } = useWorkflowStore();

  const nodesWithStatus = nodes.map((node) => {
    const status = nodeStatuses.get(node.id) || "idle";

    let style = { ...node.style };
    switch (status) {
      case "running":
        style = {
          ...style,
          borderColor: "#FFA500",
          border: "2px solid #FF8C00",
          borderRadius: "10px",

          boxShadow: "0 0 10px rgba(255, 165, 0, 0.5)",
        };
        break;
      case "completed":
        style = {
          ...style,
          padding: "10px",
          backgroundColor: "#3CB371",
          borderRadius: "10px",
          // border: "2px solid #45a049",
          color: "white",
        };
        break;
      case "failed":
        style = {
          ...style,
          borderRadius: "10px",

          backgroundColor: "#F44336",
          // border: "2px solid #da190b",
          color: "white",
        };
        break;
      default:
        style = {
          ...style,
          backgroundColor: "#FFFFFF",
          // border: "1px solid #ddd",
        };
    }

    return { ...node, style };
  });

  useEffect(() => {
    if (workflowId) {
      // Load the specific workflow when component mounts or workflowId changes
      loadWorkflow(workflowId);
      loadUserCredentials();
      loadTriggers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId]); // Only depend on workflowId, not the function references

  const handleSave = async () => {
    try {
      await saveWorkflow(workflowId); // pass workflowId for updating
    } catch (error) {
      console.error("Error saving workflow:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-lg">Loading workflow...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col">
      <WorkflowNavbar
        projectName={projectName}
        isActive={isWorkflowActive}
        onSave={handleSave}
        onActiveToggle={setIsWorkflowActive}
        onNameChange={useWorkflowStore.getState().setProjectName}
        isSaving={isSaving}
        isViewMode={true}
        getViewportCenter={getViewportCenter}
      />
      <div className="flex-1 relative bg-[#0C0D0E]">
        <ReactFlow
          className="h-full w-full"
          nodes={nodesWithStatus}
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
          <Background color="#1a1b1e" gap={16} size={2} />
          <MiniMap nodeStrokeWidth={3} nodeColor="#14b8a6" zoomable pannable />
        </ReactFlow>

        {executionEvents.length > 0 && (
          <div className="absolute bottom-4 left-4 max-w-md bg-white border-2 border-teal-200 rounded-lg shadow-xl p-4 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">Execution Log</h4>
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium">
                {executionEvents.length} events
              </span>
            </div>
            <div className="space-y-2">
              {executionEvents.slice(-10).reverse().map((event, index) => (
                <div key={index} className="text-xs border-l-2 pl-3 py-1 border-gray-200">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${event.status === "started"
                        ? "text-orange-600"
                        : event.status === "completed"
                          ? "text-green-600"
                          : "text-red-600"
                        }`}
                    >
                      {event.status === "started" ? "▶" : event.status === "completed" ? "✓" : "✗"}
                    </span>
                    <span className="text-gray-600 font-medium">{event.nodeId}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${event.status === "started"
                        ? "bg-orange-100 text-orange-700"
                        : event.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {event.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function WorkflowPageContent() {
  return (
    <ReactFlowProvider>
      <WorkflowContent />
    </ReactFlowProvider>
  );
}

export default function WorkflowPage() {
  return (
    <ProtectedRoute>
      <WorkflowPageContent />
    </ProtectedRoute>
  );
}
