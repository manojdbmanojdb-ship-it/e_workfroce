import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import type { Task } from '../types';
import { 
  Search, Filter, CheckSquare, Clock, MapPin, 
  AlertCircle, ChevronRight, CheckCircle2, RefreshCw 
} from 'lucide-react';

export const TasksScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await apiService.getTasks();
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch (e) {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesTab = 
      filterTab === 'all' ? true :
      filterTab === 'pending' ? (task.status === 'pending') :
      filterTab === 'in_progress' ? (task.status === 'in_progress') :
      (task.status === 'completed');

    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.address && task.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30';
      case 'high': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'medium': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return { text: 'COMPLETED', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
      case 'in_progress': return { text: 'IN PROGRESS', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' };
      default: return { text: 'DISPATCHED', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-24">
      {/* Search Input */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search work orders, site addresses..."
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
        />
        <button
          onClick={loadTasks}
          className="absolute right-2.5 top-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-xs overflow-x-auto">
        {[
          { key: 'all', label: `All (${tasks.length})` },
          { key: 'pending', label: `Pending (${tasks.filter(t => t.status === 'pending').length})` },
          { key: 'in_progress', label: `In Progress (${tasks.filter(t => t.status === 'in_progress').length})` },
          { key: 'completed', label: `Done (${tasks.filter(t => t.status === 'completed').length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterTab(key as any)}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterTab === key
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center rounded-3xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 space-y-2">
            <CheckSquare className="h-8 w-8 text-slate-400 mx-auto" />
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">No tasks match filter</div>
            <p className="text-[11px] text-slate-500">Try changing your search query or switching tabs.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const statusBadge = getStatusBadge(task.status);
            return (
              <div
                key={task.id}
                onClick={() => navigateTo('task_details', task.id)}
                className="p-4 rounded-3xl bg-white dark:bg-[#091222] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/50 cursor-pointer active:scale-98 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${getPriorityStyle(task.priority)} uppercase tracking-wider`}>
                      {task.priority}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.color} tracking-wider`}>
                      {statusBadge.text}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {task.due || 'Today'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {task.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                    <span className="truncate max-w-[190px]">{task.address || 'Field Location, Delhi'}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
