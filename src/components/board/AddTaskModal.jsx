import React, { useState } from 'react';
import { X, Save, Loader2, Calendar, Tag, Layers, Github } from 'lucide-react';
import sql from '@/lib/db';

export const AddTaskModal = ({ isOpen, onClose, projects, columns, onTaskAdded }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    description: '',
    priority: 'low',
    columnId: columns[0]?.id || '', // Default to first column (usually To Do)
    projectId: projects[0]?.id || '',
    githubIssueUrl: '' // Optional: Paste a URL to auto-link
  });

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.content) return;
    
    setLoading(true);
    try {
      // 1. Extract Issue Number if URL is provided
      let issueNumber = null;
      let repo = null;
      
      if (formData.githubIssueUrl) {
          const match = formData.githubIssueUrl.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
          if (match) {
             repo = `${match[1]}/${match[2]}`;
             issueNumber = parseInt(match[3]);
          }
      }

      // 2. Insert into DB
      await sql`
        INSERT INTO tasks (content, description, project_id, column_id, priority, github_repo, github_issue_number)
        VALUES (
          ${formData.content}, 
          ${formData.description}, 
          ${formData.projectId}, 
          ${formData.columnId}, 
          ${formData.priority},
          ${repo},
          ${issueNumber}
        )
      `;

      onTaskAdded();
      onClose();
      // Reset form
      setFormData({ ...formData, content: '', description: '', githubIssueUrl: '' });
    } catch (error) {
      console.error("Failed to add task:", error);
      alert("Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="
          relative w-full md:w-[600px] 
          bg-white dark:bg-slate-900 
          rounded-t-2xl md:rounded-2xl 
          shadow-2xl flex flex-col max-h-[90vh]
          animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-5 duration-200
      ">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">New Task</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Task Title</label>
            <input 
              autoFocus
              placeholder="What needs to be done?"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Description (Optional)</label>
            <textarea 
              rows={3}
              placeholder="Add details..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
             {/* Project Select */}
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                   <Layers size={12} /> Project
                </label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.projectId}
                  onChange={e => setFormData({...formData, projectId: e.target.value})}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
             </div>

             {/* Priority Select */}
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                   <Tag size={12} /> Priority
                </label>
                <div className="flex bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                  {['low', 'medium', 'high'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({...formData, priority: p})}
                      className={`flex-1 capitalize text-xs font-bold py-1.5 rounded-md transition-all ${formData.priority === p ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          {/* GitHub Link (Optional) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
             <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                <Github size={12} /> Link to GitHub Issue (Optional)
             </label>
             <input 
               placeholder="https://github.com/owner/repo/issues/123"
               className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
               value={formData.githubIssueUrl}
               onChange={e => setFormData({...formData, githubIssueUrl: e.target.value})}
             />
             <p className="text-[10px] text-slate-400 mt-1 ml-1">Paste a full URL to auto-link this card.</p>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={loading || !formData.content}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Create Task
          </button>
        </div>

      </div>
    </div>
  );
};