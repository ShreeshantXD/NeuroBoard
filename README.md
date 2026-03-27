# NeuroBoard (Competition Demo)
**From rough sketches to intelligent diagrams.**

This project is a simplified version of NeuroBoard designed for local competition presentations. It uses a Smart Canvas with Fabric.js, a Math Solver via OpenRouter, and AI-powered Diagram Suggestions.

---

## 🛠 Features
1. **Smart Canvas**: Draw rectangles, circles, arrows, and text.
2. **Clean Diagram**: Instantly convert rough freehand sketches into perfect geometric shapes.
3. **Math Solver**: Type an expression (e.g., `2+2`) and see the answer appear on your canvas.
4. **Topic Suggestions**: Search for any topic and get 3 relevant educational diagram ideas.

---

## 🚀 How to Run Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- An **OpenRouter API Key** (for Math Solver & Suggestions).

### 2. Backend Setup
1. Open a terminal in `neuroboard/backend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder:
   ```env
   OPENROUTER_API_KEY=your_key_here
   PORT=3001
   ```
4. Start the backend:
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. Open a **new** terminal in `neuroboard/frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser at: [http://localhost:5173](http://localhost:5173)

---

## 🏗 Project structure
- `frontend/`: React + Vite + Fabric.js
- `backend/`: Node.js + Express + OpenRouter Integration

---

## 💡 Notes for Presentation
- **Demo Flow**: Draw a rough circle -> Click "Clean Diagram" -> Enter math expression -> Enter topic search.
- **No Docker**: This version runs purely on Node.js processes for maximum stability during the presentation.
