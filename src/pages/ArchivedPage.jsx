import React, { useEffect, useState } from 'react';
import { Search, RotateCcw, Trash2, Inbox } from 'lucide-react';
import { useBoard } from '@/context/BoardContext';
import { api } from '@/services/api'; 

export const ArchivedPage = () => {
  const { restoreTask, deleteForever } = useBoard();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Archive Data Locally since it's a separate page
  const fetchArchived = async () => {
    setLoading(true);
    try {
      const data = await api.getArchivedTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load archive:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const handleRestore = async (id) => {
    await restoreTask(id);
    fetchArchived(); // Refresh list
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task forever? This cannot be undone.")) return;
    await deleteForever(id);
    fetchArchived(); // Refresh list
  };

  const filteredTasks = tasks.filter(t => 
    t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950">
      
      {/* Header Area (Safe Area Aware) */}
      <div className="pt-[calc(env(safe-area-inset-top)+2rem)] px-6 md:px-10 pb-4 flex-shrink-0">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Archive</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">History of completed work</p>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search history..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-32">
        
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-400 animate-pulse">
            Loading archive...
          </div>
        ) : filteredTasks.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-50">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
               <Inbox size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No archived tasks</h3>
            <p className="text-sm text-slate-500 max-w-[200px]">Tasks you archive will appear here for safekeeping.</p>
          </div>
        ) : (
          // Task List
          <div className="flex flex-col gap-3">
            {filteredTasks.map((task) => (
              <div 
                key={task.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-3 group transition-all hover:shadow-md"
              >
                {/* Top Row: Project & Date */}
                <div className="flex justify-between items-start">
                   <span 
                     className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500"
                     style={{ color: task.project_color }}
                   >
                     {task.project_name || 'No Project'}
                   </span>
                </div>

                {/* Content */}
                <div>
                   <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base leading-snug line-through opacity-70 decoration-slate-400">
                     {task.content}
                   </h3>
                   {task.description && (
                     <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.description}</p>
                   )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
                   <button 
                     onClick={() => handleRestore(task.id)}
                     className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors"
                   >
                     <RotateCcw size={14} /> Restore
                   </button>
                   
                   <button 
                     onClick={() => handleDelete(task.id)}
                     className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                     title="Delete Forever"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};