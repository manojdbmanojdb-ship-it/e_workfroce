import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, AlertTriangle, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';

const CONTACTS = [
  { id: 'emp-1', name: 'Rahul Sharma', role: 'Technician', status: 'online', task: 'HVAC Maintenance #T-402' },
  { id: 'emp-2', name: 'Priya Patel', role: 'Sales Executive', status: 'online', task: 'Client Visit #C-118' },
  { id: 'emp-3', name: 'Amit Verma', role: 'Delivery Agent', status: 'offline', task: 'Delivery #D-891' },
  { id: 'emp-4', name: 'Sneha Rao', role: 'Site Inspector', status: 'online', task: 'Safety Audit #A-552' },
];

const INITIAL_MSGS = [
  { id: 1, from: 'Rahul Sharma', text: 'Reached the site. Starting HVAC inspection now.', time: '09:15 AM', mine: false },
  { id: 2, from: 'Manager', text: 'Good. Please take photos before and after the repair.', time: '09:17 AM', mine: true },
  { id: 3, from: 'Rahul Sharma', text: 'Noted! Compressor unit is faulty. Will need a replacement part.', time: '09:32 AM', mine: false },
  { id: 4, from: 'Manager', text: 'Approved. Check the parts inventory in the van. Serial: COMP-2291.', time: '09:35 AM', mine: true },
];

export default function ChatPage({ darkMode = false }) {
  const [selected, setSelected] = useState(CONTACTS[0]);
  const [messages, setMessages] = useState(INITIAL_MSGS);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/chat/messages');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const loaded = data.data.map(m => ({
          id: m.id,
          from: m.sender_id === '00000000-0000-0000-0000-000000000000' ? 'Rahul Sharma' : 'Manager',
          text: m.content,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mine: m.sender_id !== '00000000-0000-0000-0000-000000000000'
        }));
        setMessages([...INITIAL_MSGS, ...loaded]);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  // Connect to Socket.io for live messaging
  useEffect(() => {
    fetchChatHistory();

    const s = io('http://localhost:5000');
    setSocket(s);

    s.on('connect', () => {
      s.emit('join_task_room', selected.task);
    });

    s.on('new_message', (msg) => {
      const text = msg.content || msg.text;
      const sender = msg.sender || (msg.sender_id === '00000000-0000-0000-0000-000000000000' ? 'Rahul Sharma' : 'Manager');
      const isMine = sender === 'Manager';
      setMessages(prev => {
        if (msg.id && prev.some(m => m.id === msg.id)) return prev;
        return [...prev, {
          id: msg.id || Date.now(),
          from: sender,
          text: text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mine: isMine
        }];
      });
    });

    return () => s.disconnect();
  }, [selected]);

  const sendMsg = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    const newMsg = {
      id: Date.now(),
      from: 'Manager',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mine: true
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');

    if (socket) {
      socket.emit('send_task_message', {
        task: selected.task,
        sender: 'Manager',
        text: text
      });
    }

    try {
      await fetch('http://localhost:5000/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: 'manager-admin-id',
          content: text
        })
      });
    } catch (_) {}
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] p-4 sm:p-6 gap-4">
      {/* Contacts Sidebar */}
      <div className={`w-72 flex-shrink-0 rounded-2xl flex flex-col overflow-hidden shadow-xs border transition-colors ${
        darkMode
          ? 'bg-slate-900/80 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className={`p-4 border-b ${
          darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50'
        }`}>
          <h2 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Field Personnel</h2>
          <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Direct task-based in-app channels</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {CONTACTS.map(c => {
            const isSel = selected.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                  isSel
                    ? darkMode
                      ? 'bg-sky-500/20 border border-sky-500/40 text-white shadow-xs'
                      : 'bg-blue-50 border border-blue-200 text-blue-900 shadow-xs font-semibold'
                    : darkMode
                      ? 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                      : 'hover:bg-slate-100/80 border border-transparent text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${
                    isSel 
                      ? (darkMode ? 'text-sky-300' : 'text-blue-700') 
                      : (darkMode ? 'text-slate-200' : 'text-slate-900')
                  }`}>
                    {c.name}
                  </span>
                  <span className={`h-2 w-2 rounded-full ${c.status === 'online' ? 'bg-emerald-500' : (darkMode ? 'bg-slate-600' : 'bg-slate-400')}`}></span>
                </div>
                <div className={`text-[10px] mt-0.5 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{c.role}</div>
                <div className={`text-[10px] mt-1 truncate font-medium ${darkMode ? 'text-sky-400' : 'text-blue-600'}`}>📋 {c.task}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Conversation Area */}
      <div className={`flex-1 rounded-2xl flex flex-col overflow-hidden shadow-sm border transition-colors ${
        darkMode
          ? 'bg-slate-900/80 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className={`p-4 border-b flex items-center space-x-3 ${
          darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
            darkMode ? 'bg-sky-500/20 text-sky-400' : 'bg-blue-100 text-blue-700'
          }`}>
            {selected.name.charAt(0)}
          </div>
          <div>
            <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selected.name}</div>
            <div className={`text-[11px] font-medium ${darkMode ? 'text-sky-400' : 'text-blue-600'}`}>Current Assignment: {selected.task}</div>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              darkMode
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}>
              ● Room Active
            </span>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 ${
          darkMode ? 'bg-[#070e1b]/60' : 'bg-slate-50/70'
        }`}>
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] border rounded-2xl px-4 py-2.5 ${
                msg.mine
                  ? darkMode
                    ? 'bg-sky-600/30 text-white border-sky-500/30 shadow-sm'
                    : 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                  : darkMode
                    ? 'bg-slate-800/90 border-slate-700 text-slate-100 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-800 shadow-xs'
              }`}>
                {!msg.mine && <div className={`text-[10px] font-bold mb-1 ${darkMode ? 'text-sky-400' : 'text-blue-600'}`}>{msg.from}</div>}
                <div className="text-xs leading-relaxed">{msg.text}</div>
                <div className={`text-[10px] mt-1 text-right ${
                  msg.mine 
                    ? (darkMode ? 'text-sky-200/70' : 'text-blue-100') 
                    : (darkMode ? 'text-slate-500' : 'text-slate-400')
                }`}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className={`p-3.5 sm:p-4 border-t flex items-center space-x-3 ${
          darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'
        }`}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMsg()}
            placeholder={`Message ${selected.name} about ${selected.task}...`}
            className={`flex-1 text-xs rounded-xl px-4 py-2.5 focus:outline-none transition-colors border ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white'
            }`}
          />
          <button
            onClick={sendMsg}
            disabled={!input.trim()}
            className={`p-2.5 rounded-xl text-white transition-all shadow-md disabled:opacity-40 cursor-pointer ${
              darkMode 
                ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-500/20' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
