import React, { useState } from "react";

export default function Suggestions({
  suggestions,
  onTopicSearch,
  loading,
  mathResult,
}) {
  const [topicInput, setTopicInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (topicInput.trim() && !loading) {
      onTopicSearch(topicInput.trim());
    }
  }

  return (
    <div className="sidebar">
      {mathResult && (
        <div className="sidebar-section">
          <div className="section-label">Math Result</div>
          <div className="math-result">
            <div className="math-expression">{mathResult.expression}</div>
            <div className="math-answer">= {mathResult.answer}</div>
          </div>
        </div>
      )}

      <div className="sidebar-section">
        <div className="section-label">Topic Suggestions</div>
        <form onSubmit={handleSubmit} className="topic-form">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="e.g. Electromagnetic Radiation"
            className="topic-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="action-btn suggest-btn"
            disabled={loading}
          >
            {loading ? "Loading..." : "Get Suggestions"}
          </button>
        </form>
      </div>

      {suggestions.length > 0 && (
        <div className="sidebar-section">
          <div className="section-label">Diagram Ideas</div>
          <div className="suggestions-list">
            {suggestions.map((s, i) => (
              <div key={i} className="suggestion-card">
                <div className="suggestion-number">{i + 1}</div>
                <div className="suggestion-content">
                  <div className="suggestion-title">{s.title}</div>
                  <div className="suggestion-desc">{s.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
