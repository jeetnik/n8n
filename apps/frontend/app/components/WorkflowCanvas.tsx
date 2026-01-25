"use client";

import { ReactFlow, ReactFlowProvider, Background, Node, Edge, Handle, Position, useNodesState, useEdgesState, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FaBolt } from "react-icons/fa";
import { MdEmail, MdMessage } from "react-icons/md";
import { SiOpenai } from "react-icons/si";
import { useEffect } from 'react';

// Custom Node Component
const CustomNode = ({ data }: any) => {
    return (
        <div className={`w-48 rounded-xl border ${data.isActive ? 'border-white/20 animate-pulse' : 'border-white/10'} bg-[#161719] p-4 shadow-xl cursor-grab active:cursor-grabbing hover:scale-105 transition-all duration-500 animate-in fade-in zoom-in-95`}>
            {/* Input Handle (left side) */}
            {data.hasInput && <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-gray-500 !border-2 !border-[#161719]" />}

            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded ${data.isActive ? 'bg-white/5' : 'bg-white/5'}`}>
                    {data.icon}
                </div>
                <span className="font-medium text-sm text-gray-200">{data.label}</span>
            </div>
            <div className={`h-6 w-full ${data.isActive ? 'bg-white/5 border border-white/10' : 'bg-white/5'} rounded text-xs px-2 flex items-center ${data.isActive ? 'text-gray-400' : 'text-gray-500'} font-mono`}>
                {data.isActive && <span className="animate-pulse mr-2">●</span>}
                {data.description}
            </div>

            {/* Output Handle (right side) */}
            {data.hasOutput && <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-gray-500 !border-2 !border-[#161719]" />}
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

// Define workflow nodes
const initialNodes: Node[] = [
    {
        id: '1',
        type: 'custom',
        position: { x: 0, y: 100 },
        data: {
            label: 'Webhook',
            description: 'POST /order/new',
            icon: <FaBolt className="w-5 h-5" />,
            isActive: false,
            hasInput: false,
            hasOutput: true,
        },
    },
    {
        id: '2',
        type: 'custom',
        position: { x: 300, y: 0 },
        data: {
            label: 'AI Analyze',
            description: 'Processing...',
            icon: <SiOpenai className="w-5 h-5" />,
            isActive: true,
            hasInput: true,
            hasOutput: true,
        },
    },
    {
        id: '3',
        type: 'custom',
        position: { x: 300, y: 200 },
        data: {
            label: 'Gmail',
            description: 'Send Email',
            icon: <MdEmail className="w-5 h-5" />,
            isActive: false,
            hasInput: true,
            hasOutput: false,
        },
    },
    {
        id: '4',
        type: 'custom',
        position: { x: 600, y: 100 },
        data: {
            label: 'Telegram',
            description: 'Send Message',
            icon: <MdMessage className="w-5 h-5" />,
            isActive: false,
            hasInput: true,
            hasOutput: false,
        },
    },
];

// Define edges (connections)
const finalEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#555', strokeWidth: 2 } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#555', strokeWidth: 2 } },
    { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#555', strokeWidth: 2 } },
];

const CanvasContent = () => {
    const { fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    useEffect(() => {
        let isMounted = true;

        const runAnimation = async () => {
            if (!isMounted) return;

            // Reset
            setNodes([]);
            setEdges([]);

            // 1. Webhook
            await new Promise(r => setTimeout(r, 500));
            if (!isMounted) return;

            setNodes((nds) => {
                const newNodes = [...nds, initialNodes[0]!];
                setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
                return newNodes;
            });

            // 2. AI Analyze
            await new Promise(r => setTimeout(r, 800));
            if (!isMounted) return;

            setNodes((nds) => {
                const newNodes = [...nds, initialNodes[1]!];
                setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
                return newNodes;
            });

            // 3. Telegram
            await new Promise(r => setTimeout(r, 800));
            if (!isMounted) return;

            setNodes((nds) => {
                const newNodes = [...nds, initialNodes[3]!];
                setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
                return newNodes;
            });

            // 4. Gmail
            await new Promise(r => setTimeout(r, 800));
            if (!isMounted) return;

            setNodes((nds) => {
                const newNodes = [...nds, initialNodes[2]!];
                setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
                return newNodes;
            });

            // 5. Connect all
            await new Promise(r => setTimeout(r, 800));
            if (!isMounted) return;

            setEdges(finalEdges);
            setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);

            // 6. Loop after delay
            await new Promise(r => setTimeout(r, 3000));
            if (isMounted) runAnimation();
        };

        runAnimation();

        return () => {
            isMounted = false;
        };
    }, [fitView, setNodes, setEdges]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesDraggable={false}
            panOnScroll={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            panOnDrag={false}
            zoomOnDoubleClick={false}
            className="bg-[#0A0A0A]"
            proOptions={{ hideAttribution: true }}
            minZoom={0.1}
            maxZoom={1.5}
            defaultEdgeOptions={{
                animated: true,
            }}
        >
            <Background color="#333" gap={24} size={1} />
        </ReactFlow>
    );
};

export default function WorkflowCanvas() {
    return (
        <div className="h-full w-full bg-[#0A0A0A]">
            {/* Running Status Badge */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-300"></span>
                </span>
                <span className="text-xs font-medium text-gray-300">Running</span>
            </div>

            <ReactFlowProvider>
                <CanvasContent />
            </ReactFlowProvider>
        </div>
    );
}
