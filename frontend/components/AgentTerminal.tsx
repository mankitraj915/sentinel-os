"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Activity, Zap, Shield, Terminal } from "lucide-react";

export default function AgentTerminal() {
  const [logs, setLogs] = useState<Array<{type: 'user' | 'agent' | 'system', content: string}>>([
    { type: 'system', content: 'SYSTEM INITIALIZED. WAITING FOR DIRECTIVE...' },
  ]);
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // FIX 1: Start with an empty string to match the Server
  const [sessionId, setSessionId] = useState("");

  // FIX 2: Generate the ID only AFTER the page loads in the browser
  useEffect(() => {
    setSessionId(`session-${Math.random().toString(36).substring(7)}`);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const runAgent = async () => {
    if (!input.trim() || isRunning) return;
    
    setIsRunning(true);
    setLogs((prev) => [...prev, { type: 'user', content: input }]);
    const prompt = input;
    setInput(""); 

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            query: prompt,
            thread_id: sessionId // Send the safe client-side ID
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n\n");
          
          lines.forEach((line) => {
            if (line.startsWith("data: ")) {
              const raw = line.replace("data: ", "");
              
              if (raw.includes("MISSION COMPLETE")) return;
              
              // Filter out duplicate system logs if needed
              if (raw.startsWith("[SUPERVISOR]") || raw.startsWith("[RESEARCHER]") || raw.startsWith("[REVIEWER]")) {
                  setLogs((prev) => [...prev, { type: 'system', content: raw }]);
              } 
              else if (raw.startsWith("[RESPONDER]")) {
                  const cleanContent = raw.replace("[RESPONDER]", "").trim();
                  setLogs((prev) => [...prev, { type: 'agent', content: cleanContent }]);
              }
            }
          });
        }
      }
    } catch (error) {
      setLogs((prev) => [...prev, { type: 'system', content: "❌ ERROR: CONNECTION SEVERED" }]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex w-full max-w-6xl h-[80vh] bg-[#0d1117] rounded-xl overflow-hidden shadow-2xl border border-gray-800 font-sans text-gray-200">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-[#010409] border-r border-gray-800 p-6 hidden md:flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-emerald-500 font-bold text-xl tracking-wider mb-8">
            <Shield className="w-6 h-6" /> SENTINEL
          </div>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[#161b22] border border-gray-800">
               <div className="text-xs text-gray-500 uppercase font-bold mb-1">System Status</div>
               <div className="flex items-center gap-2 text-emerald-400 text-sm font-mono">
                 <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-orange-500 animate-pulse" : "bg-emerald-500"}`}></div>
                 {isRunning ? "PROCESSING" : "OPERATIONAL"}
               </div>
            </div>
            
            <div className="p-3 rounded-lg bg-[#161b22] border border-gray-800">
               <div className="text-xs text-gray-500 uppercase font-bold mb-1">Session ID</div>
               {/* Display a placeholder while loading to prevent flickering */}
               <div className="text-gray-400 text-xs font-mono truncate" title={sessionId}>
                 {sessionId || "INITIALIZING..."}
               </div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-600 font-mono text-center">
          v2.1.0 // SECURE TERMINAL
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative bg-[#0d1117]">
        
        {/* MESSAGES LOG */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-gray-700">
          {logs.map((log, i) => (
            <div key={i} className={`flex ${log.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              <div className={`max-w-[85%] p-5 rounded-lg shadow-md ${
                log.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : log.type === 'system'
                  ? 'bg-transparent text-gray-500 font-mono text-xs border border-gray-800 w-full'
                  : 'bg-[#161b22] text-gray-300 border border-gray-800 w-full'
              }`}>
                {log.type === 'agent' ? (
                  <div className="markdown-body text-sm leading-7">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {log.content}
                    </ReactMarkdown>
                  </div>
                ) : log.type === 'system' ? (
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    <span>{log.content}</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{log.content}</div>
                )}
              </div>
            </div>
          ))}
          
          {isRunning && (
            <div className="flex items-center gap-2 text-gray-500 text-sm ml-4 animate-pulse font-mono">
               <Activity className="w-4 h-4" /> NEURAL NETWORK ACTIVE...
            </div>
          )}
          <div ref={logsEndRef} />
        </div>

        {/* INPUT FIELD */}
        <div className="p-6 bg-[#010409] border-t border-gray-800">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAgent()}
              placeholder="Enter directive..."
              className="w-full bg-[#0d1117] text-gray-100 border border-gray-700 rounded-lg pl-4 pr-12 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner placeholder-gray-600 transition-all"
              disabled={isRunning}
              autoFocus
            />
            <button
              onClick={runAgent}
              disabled={isRunning}
              className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-blue-900/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}