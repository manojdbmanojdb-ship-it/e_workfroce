import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Send, User, Sparkles, Clock,
  RefreshCw, CheckCheck, Megaphone, Hash
} from 'lucide-react';
import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api/employee';

export default function EmployeeMessagesPage({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState('direct'); // 'direct' | 'announcements' | 'tasks'
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';
      const res = await fetch(`${API_BASE}/messages?userId=${userId}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMessages(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Listen for live socket messages
    const socket = io('http://localhost:5000');
    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev.filter(m => m.id !== msg.id), msg]);
    });

    return () => socket.disconnect();
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      setSending(true);
      const userId = currentUser?.user_id || currentUser?.id || 'usr-102';
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          content: inputText.trim(),
          channel: activeChannel,
          recipientId: activeChannel === 'announcements' ? 'team' : 'usr-101'
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setMessages(prev => [...prev.filter(m => m.id !== json.data.id), json.data]);
        setInputText('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter(m => {
    if (activeChannel === 'announcements') return m.channel === 'announcements';
    if (activeChannel === 'tasks') return m.channel === 'tasks' || m.task_id;
    return m.channel === 'direct' || (!m.channel && !m.task_id);
  });

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col sm:flex-row gap-5">
      {/* Channels Sidebar */}
      <div className="sm:w-64 flex-shrink-0 p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <MessageSquare className="h-5 w-5 text-sky-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Communications</h2>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveChannel('direct')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeChannel === 'direct'
                  ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Manager Direct Chat</span>
            </button>

            <button
              onClick={() => setActiveChannel('announcements')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeChannel === 'announcements'
                  ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Megaphone className="h-4 w-4" />
              <span>Team Announcements</span>
            </button>

            <button
              onClick={() => setActiveChannel('tasks')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeChannel === 'tasks'
                  ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Hash className="h-4 w-4" />
              <span>Task Service Threads</span>
            </button>
          </div>
        </div>

        {/* Dispatch Authority Card */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750 text-xs">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-base">👔</span>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Rajesh Kumar</div>
              <div className="text-[10px] text-sky-500">Reporting Manager</div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Available on Headquarters Dispatch Hotline</p>
        </div>
      </div>

      {/* Chat Thread Panel */}
      <div className="flex-1 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        {/* Chat Thread Header */}
        <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold text-xs">
              {activeChannel === 'announcements' ? '📢' : activeChannel === 'tasks' ? '#' : '👔'}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                {activeChannel === 'announcements'
                  ? 'Company & Field Team Announcements'
                  : activeChannel === 'tasks'
                  ? 'Task-Related Work Order Discussions'
                  : 'Direct Channel: Operations Manager (Rajesh Kumar)'}
              </h3>
              <p className="text-[10px] text-emerald-500 font-bold flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Encrypted Field Stream</span>
              </p>
            </div>
          </div>

          <button
            onClick={fetchMessages}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 cursor-pointer"
            title="Refresh Messages"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              <RefreshCw className="h-5 w-5 animate-spin text-sky-500 mr-2" />
              <span>Loading messages...</span>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 space-y-1">
              <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-700" />
              <p className="font-bold text-slate-600 dark:text-slate-400">No messages in this channel yet.</p>
              <p className="text-[11px]">Type a message below to start the conversation.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMe = msg.sender_id === (currentUser?.user_id || 'usr-102');
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                      {msg.sender_avatar || '👔'}
                    </div>
                  )}

                  <div className={`max-w-md rounded-2xl p-3.5 text-xs ${
                    isMe
                      ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-br-none shadow-md shadow-blue-500/10'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700'
                  }`}>
                    {!isMe && (
                      <div className="text-[10px] font-bold text-sky-600 dark:text-sky-400 mb-0.5">
                        {msg.sender_name} ({msg.sender_role})
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <div className={`text-[9px] font-mono mt-1 text-right flex items-center justify-end space-x-1 ${
                      isMe ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${activeChannel === 'direct' ? 'Manager Rajesh Kumar' : activeChannel}...`}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
