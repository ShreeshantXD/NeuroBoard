import React from "react";

const tools = [
  { id: "select", label: "Select", icon: "↖" },
  { id: "pen", label: "Pen", icon: "✏" },
  { id: "rectangle", label: "Rect", icon: "▭" },
  { id: "circle", label: "Circle", icon: "○" },
  { id: "arrow", label: "Arrow", icon: "→" },
  { id: "text", label: "Text", icon: "T" },
  { id: "eraser", label: "Eraser", icon: "⌫" },
];

const colors = [
  "#ffffff", // Snow
  "#ef4444", // Red
  "#f59e0b", // Amber
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#cba6f7", // Mauve (Purple)
  "#ec4899", // Pink
  "#06b6d4", // Cyan
];

export default function Toolbar({
  activeTool,
  setActiveTool,
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  onCleanDiagram,
  onClearCanvas,
}) {
  return (
    <div className="toolbar">
      <div className="section">
        <div className="section-title">Tools</div>
        <div className="tool-grid">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`tool-btn ${activeTool === tool.id ? "active" : ""}`}
              onClick={() => setActiveTool(tool.id)}
              title={tool.label}
            >
              <span className="icon">{tool.icon}</span>
              <span className="label text-xs uppercase font-semibold">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-title">Colors</div>
        <div className="color-grid">
          {colors.map((c) => (
            <button
              key={c}
              className={`color-btn ${brushColor === c ? "active" : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => setBrushColor(c)}
            />
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-title flex justify-between">
          Size: <span>{brushSize}px</span>
        </div>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="size-slider w-full"
        />
      </div>

      <div className="section actions-section">
        <div className="section-title">Actions</div>
        <button className="btn btn-primary" onClick={onCleanDiagram}>
          Convert Sketch
        </button>
        <button className="btn btn-secondary" onClick={onClearCanvas}>
          Clear Canvas
        </button>
      </div>
    </div>
  );
}
