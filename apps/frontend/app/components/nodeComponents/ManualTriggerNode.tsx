"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, Position } from "@xyflow/react";
import { Pointer } from "lucide-react";

export function ManualTriggerNode({ data }: { data: any }) {
  return (
    <div className=" rounded-l-3xl bg-cyan-900/80  relative cursor-grab active:cursor-grabbing">
      <div className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
        <div className="text-xs text-white max-w-[30px] mx-3">{data.label}</div>
        <div className="flex  justify-center items-center">
          <Pointer className="w-6 h-6 text-white " />
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-blue-300 border-2 border-blue-500"
      />
    </div>
  );
}
