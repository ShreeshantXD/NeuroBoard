import React, { useState } from "react";

export default function MathSolver({ onSolve, onSolveSketch, apiUrl, setError }) {
  const [mathInput, setMathInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSolveSketch() {
    if (loading) return;
    setLoading(true);
    try {
      await onSolveSketch();
    } catch (err) {
      setError("Failed to solve drawing. Check backend/OpenRouter key.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMathSubmit(e) {
    e.preventDefault();
    if (!mathInput.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/solve-math`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression: mathInput.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      onSolve(`${data.expression} = ${data.answer}`);
      setMathInput("");
    } catch (err) {
      setError("Failed to solve math. Check backend/OpenRouter key.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="math-solver">
      <div className="solver-label">Math Tools</div>
      <div className="math-form">
        <button 
          onClick={handleSolveSketch} 
          className="btn btn-secondary solve-btn" 
          disabled={loading}
          style={{ width: "auto", minWidth: "200px" }}
        >
          {loading ? "Scanning Drawing..." : "Solve from Drawing 🎨"}
        </button>
        
        <div style={{ width: "1px", height: "30px", background: "var(--border)", margin: "0 10px" }} />

        <form onSubmit={handleMathSubmit} style={{ display: "flex", flex: 1, gap: "10px" }}>
          <input
            type="text"
            value={mathInput}
            onChange={(e) => setMathInput(e.target.value)}
            placeholder="Or type math (e.g. 2 + 2)"
            className="math-input"
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !mathInput.trim()}>
            {loading ? "..." : "Solve & Type"}
          </button>
        </form>
      </div>
    </div>
  );
}
