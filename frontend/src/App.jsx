import React, { useState, useRef } from "react";
import Toolbar from "./Toolbar";
import CanvasBoard from "./CanvasBoard";
import SuggestionPanel from "./SuggestionPanel";
import MathSolver from "./MathSolver";
import "./styles.css";

/**
 * Main Application Component
 * 
 * Layout:
 * Top: Header
 * Left: Toolbar
 * Center: Canvas
 * Right: SuggestionPanel (Topic Suggestions)
 * Bottom: MathSolver
 */
export default function App() {
  const [activeTool, setActiveTool] = useState("select");
  const [brushColor, setBrushColor] = useState("#cba6f7");
  const [brushSize, setBrushSize] = useState(3);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const canvasRef = useRef(null);
  const API_URL = "http://localhost:3001/api";

  const handleCleanDiagram = () => {
    if (canvasRef.current) canvasRef.current.cleanDiagram();
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) canvasRef.current.clearCanvas();
  };

  const handleTopicSearch = async (topic) => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/topic-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuggestions(data.suggestions);
    } catch (err) {
      setError("Failed to get suggestions. Check backend/OpenRouter key.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMathSolved = (result) => {
    if (canvasRef.current && result) {
      canvasRef.current.addText(result, 200, 200);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">N</div>
          <h1>NeuroBoard</h1>
        </div>
        <div className="tagline">From rough sketches to intelligent diagrams</div>
      </header>

      <div className="main-layout">
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          brushColor={brushColor}
          setBrushColor={setBrushColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          onCleanDiagram={handleCleanDiagram}
          onClearCanvas={handleClearCanvas}
        />
        
        <main className="canvas-area">
          <CanvasBoard
            ref={canvasRef}
            activeTool={activeTool}
            brushColor={brushColor}
            brushSize={brushSize}
          />
        </main>

        <SuggestionPanel
          suggestions={suggestions}
          onSearch={handleTopicSearch}
          loading={loading}
        />
      </div>

      <footer className="footer">
        <MathSolver
          onSolve={(text) => canvasRef.current.addText(text)}
          onSolveSketch={() => canvasRef.current.solveSketchMath(API_URL)}
          apiUrl={API_URL}
          setError={setError}
        />
      </footer>

      {error && (
        <div className="error-toast" onClick={() => setError(null)}>
          {error}
          <span className="close-toast">×</span>
        </div>
      )}
    </div>
  );
}
