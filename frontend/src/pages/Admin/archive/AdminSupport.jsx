import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  User, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Search,
  MoreVertical
} from 'lucide-react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function AdminSupport() {
  const { user: admin } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef();

  // 1. Initial Sync of Support Queue
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await api.get('/admin/support/threads');
        setConversations(res.data.threads || []);
      } catch (err) {
        toast.error("Support Terminal Sync Offline");
      }
    };
    fetchThreads();
  }, []);

  // 2. Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;

    const newMessage = {
      sender: admin._id,
      text: input,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInput('');

    try {
      await api.post(`/admin/support/reply/${activeChat._id}`, { text: input });
    } catch (err) {
      toast.error("Transmission Failure");
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 animate-fade-in text-white">
      
      {/* LEFT: INQUIRY QUEUE */}
      <div className="w-80 flex flex-col glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-white/5 flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <MessageSquare size={14} className="text-blue-500" /> Active Inquiries
          </h3>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={12} />
            <input 
              type="text" 
              placeholder="Search Investor..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-[10px] outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {conversations.map((chat) => (
            <div 
              key={chat._id}
              onClick={() => setActiveChat(chat)}
              className={`p-4 cursor-pointer transition-all border-l-4 ${
                activeChat?._id === chat._id ? 'bg-blue-600/10 border-l-blue-500' : 'border-l-transparent hover:bg-white/5'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-bold truncate pr-2">{chat.user?.fullName}</p>
                <span className="text-[8px] font-mono text-slate-500">12:45</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate italic">"{chat.lastMessage}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: TERMINAL INTERFACE */}
      <div className="flex-1 flex flex-col glass-card relative overflow-hidden">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black">
                  {activeChat.user?.fullName[0]}
                </div>
                <div>
                  <h4 className="text-sm font-black italic uppercase tracking-tight">{activeChat.user?.fullName}</h4>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Live Connection Established</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                 <div className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"><ShieldCheck size={16} /></div>
                 <div className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"><MoreVertical size={16} /></div>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 no-scrollbar bg-[url('https://www.transparenttextures.com')]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === admin._id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === admin._id 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}>
                    {msg.text}
                    <p className={`text-[8px] mt-2 font-bold uppercase opacity-50 ${msg.sender === admin._id ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* Input Console */}
            <form onSubmit={handleSendMessage} className="p-6 bg-slate-900/80 border-t border-slate-800">
              <div className="relative">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter secure message..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-6 pr-16 text-xs text-blue-400 outline-none focus:border-blue-500 transition-all font-mono"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
            <MessageSquare size={100} className="text-slate-800 mb-6" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Awaiting Support Link Initialization</p>
          </div>
        )}
      </div>
    </div>
  );
}

