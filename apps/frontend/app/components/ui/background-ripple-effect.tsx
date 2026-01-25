"use client";
import React, { useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export const BackgroundRippleEffect = ({
    rows = 10,
    cols = 45,
    cellSize = 60,
}: {
    rows?: number;
    cols?: number;
    cellSize?: number;
}) => {
    const [clickedCell, setClickedCell] = useState<{
        row: number;
        col: number;
    } | null>(null);
    const [rippleKey, setRippleKey] = useState(0);
    const ref = useRef<any>(null);

    return (
        <div
            ref={ref}
            className={cn(
                "absolute inset-0 h-full w-full pointer-events-none overflow-hidden flex items-start justify-center pt-20",
            )}
            style={{
                maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 80%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 80%)",
            }}
        >
            <DivGrid
                key={`base-${rippleKey}`}
                className="opacity-50"
                rows={rows}
                cols={cols}
                cellSize={cellSize}
                borderColor="rgba(255, 255, 255, 0.1)"
                fillColor="rgba(255, 255, 255, 0.02)"
                clickedCell={clickedCell}
                onCellClick={(row, col) => {
                    setClickedCell({ row, col });
                    setRippleKey((k) => k + 1);
                }}
                interactive
            />
        </div>
    );
};

type DivGridProps = {
    className?: string;
    rows: number;
    cols: number;
    cellSize: number;
    borderColor: string;
    fillColor: string;
    clickedCell: { row: number; col: number } | null;
    onCellClick?: (row: number, col: number) => void;
    interactive?: boolean;
};

type CellStyle = React.CSSProperties & {
    ["--delay"]?: string;
    ["--duration"]?: string;
};

const DivGrid = ({
    className,
    rows = 10,
    cols = 45,
    cellSize = 60,
    borderColor = "rgba(255, 255, 255, 0.1)",
    fillColor = "rgba(255, 255, 255, 0.02)",
    clickedCell = null,
    onCellClick = () => { },
    interactive = true,
}: DivGridProps) => {
    const cells = useMemo(
        () => Array.from({ length: rows * cols }, (_, idx) => idx),
        [rows, cols],
    );

    const gridStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        width: cols * cellSize,
        height: rows * cellSize,
    };

    return (
        <div className={cn("relative z-[1]", className)} style={gridStyle}>
            {cells.map((idx) => {
                const rowIdx = Math.floor(idx / cols);
                const colIdx = idx % cols;
                const distance = clickedCell
                    ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
                    : 0;
                const delay = clickedCell ? Math.max(0, distance * 45) : 0;
                const duration = 200 + distance * 65;

                const style: CellStyle = clickedCell
                    ? {
                        "--delay": `${delay}ms`,
                        "--duration": `${duration}ms`,
                    }
                    : {};

                return (
                    <div
                        key={idx}
                        className={cn(
                            "cell relative border-[0.5px]",
                            clickedCell && "animate-cell-ripple [animation-fill-mode:none]",
                            !interactive && "pointer-events-none",
                        )}
                        style={{
                            backgroundColor: fillColor,
                            borderColor: borderColor,
                            ...style,
                        }}
                        onClick={
                            interactive ? () => onCellClick?.(rowIdx, colIdx) : undefined
                        }
                    />
                );
            })}
        </div>
    );
};
