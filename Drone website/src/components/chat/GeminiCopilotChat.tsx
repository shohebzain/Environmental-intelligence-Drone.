import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Minimize2,
  Maximize2,
  Activity,
  Cpu,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export const GeminiCopilotChat: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hello Officer! I am your **Gemini Environmental Intelligence Assistant**. I monitor real-time methane gas concentrations, AQI indices, drone flight paths, and dispersion models across Hyderabad. How can I assist your mission today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      modelUsed: "gemini-2.5-flash",
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat thread
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        content: m.content,
      }));
      historyPayload.push({ role: "user", content: text });

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          contextData: {
            officerName: user?.displayName || "Environmental Officer",
            officerEmail: user?.email || "anonymous@hyderabad.gov.in",
            monitoredZones: ["Jawaharnagar Waste Management", "Patancheru Industrial Belt", "Hussain Sagar Lake", "HITEC City"],
            activeDrone: "EID-HYD-01 (Altitude: 52m AGL)",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to contact Gemini API");
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.text || "I have processed your environmental query.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.modelUsed || "gemini-2.5-flash",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "⚠️ I encountered a connection issue querying the Gemini Environmental Intelligence model. Please verify your network connection or try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content:
          "Conversation reset. How can I assist with your environmental telemetry or drone flight mission?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const quickPrompts = [
    "Analyze Jawaharnagar methane plume risk",
    "What is the current wind vector and AQI?",
    "Suggest flight waypoint optimization for EID-HYD-01",
    "Draft a municipal hazard notification",
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 bg-emerald-700 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 border border-emerald-500 cursor-pointer font-sans text-xs font-bold"
          title="Open Gemini Environmental AI Copilot"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-200 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          </div>
          <span className="hidden sm:inline">Gemini AI Copilot</span>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col font-sans transition-all duration-300 overflow-hidden ${
            isExpanded
              ? "inset-4 md:inset-10"
              : "bottom-4 right-4 w-full max-w-md h-[560px] max-h-[85vh]"
          }`}
        >
          {/* Header */}
          <div className="bg-slate-950 border-b border-slate-800 p-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs border border-emerald-500">
                <Sparkles className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-100 text-xs">EID Gemini Assistant</h3>
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded">
                    gemini-2.5-flash
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Hyderabad Environmental Intelligence Copilot
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
                title="Reset Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors hidden sm:block"
                title={isExpanded ? "Restore window size" : "Expand window"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
                title="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Status Bar */}
          {user && (
            <div className="bg-slate-950/60 border-b border-slate-800/80 px-3 py-1.5 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1.5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ""} className="w-3.5 h-3.5 rounded-full" />
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Authenticated: <strong className="text-slate-200">{user.displayName || user.email}</strong></span>
              </span>
              <span className="text-emerald-400 font-mono">Firestore Session Active</span>
            </div>
          )}

          {/* Message Thread Area */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-800 text-emerald-200 flex items-center justify-center shrink-0 border border-emerald-600 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed space-y-1 ${
                    m.role === "user"
                      ? "bg-emerald-700 text-white rounded-tr-xs"
                      : "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <div
                    className={`text-[9px] font-mono flex items-center justify-between gap-2 border-t pt-1 ${
                      m.role === "user" ? "text-emerald-200/80 border-emerald-600/40" : "text-slate-400 border-slate-700/60"
                    }`}
                  >
                    <span>{m.timestamp}</span>
                    {m.modelUsed && <span>{m.modelUsed}</span>}
                  </div>
                </div>

                {m.role === "user" && (
                  <div className="w-6 h-6 rounded-lg bg-slate-700 text-slate-200 flex items-center justify-center shrink-0 border border-slate-600 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800 w-fit">
                <Cpu className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>Gemini model reasoning and analyzing environmental data...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800 overflow-x-auto whitespace-nowrap shrink-0 flex items-center gap-1.5 scrollbar-none">
            <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Prompts:</span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                disabled={loading}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-lg transition-colors shrink-0 disabled:opacity-50"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Gemini AI Copilot about AQI, methane plumes, or flight logs..."
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
