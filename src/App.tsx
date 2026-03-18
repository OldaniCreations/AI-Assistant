import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Plus, 
  Search, 
  Mic, 
  Send, 
  MoreVertical, 
  Sparkles,
  Database,
  Zap,
  Eye,
  Layout,
  Edit3,
  ChevronRight,
  User,
  Heart,
  Grid,
  Shield,
  MessageSquare,
  Command,
  ArrowRight,
  X,
  Settings,
  History,
  Compass,
  Layers,
  Star
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Assistant {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  color: string;
  systemInstruction: string;
}

// --- Data ---
const ASSISTANTS: Assistant[] = [
  { 
    id: "inteldev", 
    name: "DevOps Specialist", 
    description: "Optimize your Intel CI/CD pipelines and repo security.", 
    icon: Database, 
    category: "Engineering",
    color: "text-blue-600",
    systemInstruction: "You are a DevOps expert. Help with CI/CD, security, and repo management."
  },
  { 
    id: "creative", 
    name: "Creative Catalyst", 
    description: "Brainstorm marketing ideas and creative campaigns.", 
    icon: Zap, 
    category: "Marketing",
    color: "text-amber-600",
    systemInstruction: "You are a creative strategist. Help with marketing and ideation."
  },
  { 
    id: "analyst", 
    name: "Data Foresight", 
    description: "Predict project timelines and analyze historical data.", 
    icon: Eye, 
    category: "Analytics",
    color: "text-emerald-600",
    systemInstruction: "You are a data analyst. Help with predictions and data insights."
  },
  { 
    id: "writer", 
    name: "Editorial Pro", 
    description: "Polish professional writing and refine your tone.", 
    icon: Edit3, 
    category: "Writing",
    color: "text-purple-600",
    systemInstruction: "You are a professional editor. Help with writing and tone."
  },
];

// --- Gemini Service ---
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function App() {
  const [view, setView] = useState<"home" | "chat">("home");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    if (view === "home") setView("chat");

    const userMsg: Message = { role: "user", content };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const model = genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, userMsg].map(m => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: activeAssistant?.systemInstruction || "You are AI Assistant Beta, a high-performance workspace assistant. Be concise, professional, and helpful."
        }
      });

      const response = await model;
      const aiMsg: Message = { 
        role: "assistant", 
        content: response.text || "I'm sorry, I couldn't generate a response."
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Error: Failed to connect to AI service." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = (assistant?: Assistant) => {
    setMessages([]);
    setActiveAssistant(assistant || null);
    setView("chat");
  };

  return (
    <div className="flex h-screen bg-bg text-slate-900 overflow-hidden font-sans">
      {/* Sidebar - Ultra Minimal */}
      <nav className="w-20 flex flex-col items-center py-8 border-r border-border bg-surface/50 backdrop-blur-xl z-20">
        <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mb-12 shadow-2xl shadow-accent/20 cursor-pointer text-white" onClick={() => setView("home")}>
          <Command size={24} />
        </div>
        
        <div className="flex-1 flex flex-col gap-8">
          <button onClick={() => setView("home")} className={`p-3 rounded-2xl transition-all flex items-center justify-center ${view === 'home' ? 'nav-item-active' : 'nav-item'}`}>
            <Compass size={24} />
          </button>
          <button onClick={() => startNewChat()} className={`p-3 rounded-2xl transition-all flex items-center justify-center ${view === 'chat' ? 'nav-item-active' : 'nav-item'}`}>
            <MessageSquare size={24} />
          </button>
          <button className="p-3 rounded-2xl transition-all flex items-center justify-center nav-item">
            <History size={24} />
          </button>
          <button className="p-3 rounded-2xl transition-all flex items-center justify-center nav-item">
            <Layers size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-8">
          <button className="p-3 rounded-2xl transition-all flex items-center justify-center nav-item">
            <Settings size={24} />
          </button>
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-border flex items-center justify-center">
            <User size={24} className="text-slate-500" />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {view === "home" ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-y-auto p-12 custom-scrollbar"
            >
              <div className="max-w-6xl mx-auto">
                <header className="mb-16">
                  <h1 className="text-6xl font-bold tracking-tight mb-4 text-slate-900">AI Assistant Beta</h1>
                  <p className="text-text-dim text-xl max-w-2xl">
                    Your high-performance workspace for intelligent collaboration. 
                    Select a module to begin.
                  </p>
                </header>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                  {/* Large Hero Card */}
                  <div className="md:col-span-2 md:row-span-2 bento-card flex flex-col justify-between group">
                    <div>
                      <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                        <Sparkles size={28} />
                      </div>
                      <h2 className="text-3xl font-bold mb-4 text-slate-900">General Intelligence</h2>
                      <p className="text-text-dim leading-relaxed">
                        A versatile assistant capable of reasoning, coding, and creative writing. 
                        Powered by the latest Gemini models.
                      </p>
                    </div>
                    <button 
                      onClick={() => startNewChat()}
                      className="mt-8 flex items-center gap-2 text-accent font-bold group-hover:gap-4 transition-all"
                    >
                      Start Conversation <ArrowRight size={20} />
                    </button>
                  </div>

                  {/* Assistant Cards */}
                  {ASSISTANTS.map((ast) => (
                    <div 
                      key={ast.id}
                      onClick={() => startNewChat(ast)}
                      className="bento-card group cursor-pointer"
                    >
                      <div className={`w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center ${ast.color} mb-4 group-hover:bg-accent/5 transition-colors`}>
                        <ast.icon size={20} />
                      </div>
                      <h3 className="font-bold mb-2 text-slate-900">{ast.name}</h3>
                      <p className="text-xs text-text-dim line-clamp-2">{ast.description}</p>
                    </div>
                  ))}

                </div>

                {/* Quick Tasks Section */}
                <section className="mb-12">
                  <h3 className="text-xs font-bold text-text-dim uppercase tracking-widest mb-6">Quick Tasks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Security Audit */}
                    <div className="bento-card bg-accent/5 border-accent/10 flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 text-white">
                          <Shield size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">Security Audit</h4>
                          <p className="text-xs text-text-dim">Scan your repositories for vulnerabilities.</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-accent group-hover:translate-x-2 transition-transform" />
                    </div>

                    {/* Forecast Launch */}
                    <div className="bento-card bg-accent/5 border-accent/10 flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 text-white">
                          <Zap size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">Forecast Launch</h4>
                          <p className="text-xs text-text-dim">Predict launch date based on roadmap data.</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-accent group-hover:translate-x-2 transition-transform" />
                    </div>

                    {/* DORA Report */}
                    <div className="bento-card bg-accent/5 border-accent/10 flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 text-white">
                          <Layout size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">Create DORA Report</h4>
                          <p className="text-xs text-text-dim">Check team efficiency and productivity.</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-accent group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </section>

                {/* Recent Activity */}
                <section>
                  <h3 className="text-xs font-bold text-text-dim uppercase tracking-widest mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    {[
                      "Optimizing PR #124 for Pantherlake",
                      "Drafting Q3 Security Roadmap",
                      "Analyzing CI/CD bottleneck in graphics-core"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border hover:bg-surface transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <History size={16} className="text-text-dim" />
                          <span className="text-sm text-slate-600 font-medium">{item}</span>
                        </div>
                        <ArrowRight size={16} className="text-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Chat Header */}
              <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <button onClick={() => setView("home")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X size={20} className="text-text-dim" />
                  </button>
                  <div className="h-4 w-px bg-border" />
                  {activeAssistant ? (
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center ${activeAssistant.color}`}>
                        <activeAssistant.icon size={16} />
                      </div>
                      <span className="font-bold text-slate-900">{activeAssistant.name}</span>
                    </div>
                  ) : (
                    <span className="font-bold text-slate-900">AI Assistant Beta</span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <button className="p-2 text-text-dim hover:text-accent transition-colors">
                    <Star size={20} />
                  </button>
                  <button className="p-2 text-text-dim hover:text-accent transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </header>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-12 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-10">
                  {messages.length === 0 && (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 bg-accent/10 rounded-3xl flex items-center justify-center text-accent mx-auto mb-8">
                        {activeAssistant ? <activeAssistant.icon size={32} /> : <Sparkles size={32} />}
                      </div>
                      <h2 className="text-3xl font-bold mb-4 text-slate-900">
                        {activeAssistant ? `Hello, I'm your ${activeAssistant.name}` : "How can I assist you today?"}
                      </h2>
                      <p className="text-text-dim max-w-md mx-auto">
                        Ask me anything about your project, code, or workflow. 
                        I'm here to help you perform at your best.
                      </p>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-6 ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                        <div className={`text-sm leading-relaxed prose max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'}`}>
                          {msg.role === 'assistant' ? (
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc ml-4 mb-4">{children}</ul>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                code: ({ children }) => <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                                pre: ({ children }) => <pre className="bg-slate-50 p-4 rounded-xl overflow-x-auto mb-4 border border-border">{children}</pre>
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          ) : (
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="chat-bubble-ai p-6">
                        <div className="flex gap-1.5">
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 bg-accent rounded-full" />
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 bg-accent rounded-full" />
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 bg-accent rounded-full" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-8 bg-gradient-to-t from-bg via-bg to-transparent">
                <div className="max-w-3xl mx-auto relative">
                  <div className="glass-light rounded-[2rem] p-2 flex items-center gap-3 shadow-2xl shadow-slate-200/50">
                    <button className="p-4 text-text-dim hover:text-accent transition-colors">
                      <Plus size={24} />
                    </button>
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
                      placeholder={activeAssistant ? `Message ${activeAssistant.name}...` : "Ask AI Assistant Beta anything..."} 
                      className="flex-1 bg-transparent border-none outline-none px-2 py-4 text-sm text-slate-700 placeholder:text-text-dim"
                    />
                    <button className="p-4 text-text-dim hover:text-accent transition-colors">
                      <Mic size={24} />
                    </button>
                    <button 
                      onClick={() => handleSendMessage(input)}
                      disabled={!input.trim() || isLoading}
                      className="w-12 h-12 bg-accent text-white rounded-2xl flex items-center justify-center hover:opacity-90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
                    >
                      <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
