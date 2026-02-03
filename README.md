# ??? Sentinel OS (v2.1)

> **Autonomous Multi-Agent Research Terminal**
> *Powered by LangGraph, Gemini Flash, and Next.js*

![Status](https://img.shields.io/badge/Status-Operational-emerald) ![Tech](https://img.shields.io/badge/AI-Agentic-blue)

## ?? System Overview
Sentinel OS is a high-performance research engine designed to replace standard search. Unlike a chatbot, Sentinel uses a **Graph-based Neural Architecture** to:
1.  **Plan:** Analyze user intent (Supervisor Node).
2.  **Hunt:** Execute live web searches using Tavily (Researcher Node).
3.  **Synthesize:** Aggregate data into professional reports with Markdown tables (Responder Node).
4.  **Remember:** Maintains context across session turns using a persistent thread ID.

It features a custom **"Dark Mode" Terminal UI** built for speed and data density.

---

## ? Technical Architecture

\\\mermaid
graph LR
    User[User Directive] --> API[FastAPI Gateway]
    API --> Supervisor{Supervisor Node}
    Supervisor -->|Needs Info| Researcher[Tavily Search]
    Supervisor -->|Has Info| Responder[Gemini Analyst]
    Researcher --> Responder
    Responder --> UI[Next.js Terminal]
\\\

## ??? Tech Stack

### **The Brain (Backend)**
* **LangGraph:** Stateful multi-agent orchestration.
* **FastAPI:** High-performance Async I/O server with WebSockets.
* **Google Gemini Flash:** Low-latency LLM for reasoning.
* **Tavily API:** Specialized AI search engine for real-time facts.

### **The Interface (Frontend)**
* **Next.js 15:** React framework with Server-Side Rendering.
* **TailwindCSS:** Utility-first styling for the "Cyberpunk" aesthetic.
* **React Markdown:** Renders tables, lists, and code blocks dynamically.

---

## ?? Installation & Setup

### 1. Clone the Repository
\\\ash
git clone https://github.com/YOUR_USERNAME/sentinel-os.git
cd sentinel-os
\\\

### 2. Backend Setup (The Brain)
\\\ash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # Mac/Linux

pip install -r requirements.txt
\\\

**Create a \.env\ file in \/backend\:**
\\\env
GOOGLE_API_KEY=your_gemini_key
TAVILY_API_KEY=your_tavily_key
\\\

**Run the Server:**
\\\ash
uvicorn main:app --reload
\\\

### 3. Frontend Setup (The Terminal)
Open a new terminal window:
\\\ash
cd frontend
npm install
npm run dev
\\\

Access the terminal at: **http://localhost:3000**

---

## ?? Capabilities

| Feature | Status | Description |
| :--- | :--- | :--- |
| **Live Search** | ? | Bypasses knowledge cutoffs using Tavily. |
| **Markdown UI** | ? | Renders complex tables and formatting. |
| **Session Memory**| ? | Remembers context (e.g., 'Who is *he*?'). |
| **Streaming** | ? | Real-time token streaming (no waiting). |
| **Auto-Correction**| ?? | Disabled for speed (Latency Optimization). |

---

## ?? License
MIT License. Built for the Future.
