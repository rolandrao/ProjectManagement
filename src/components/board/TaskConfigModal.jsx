import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Calendar, Tag, Layers, Archive, Trash2 } from 'lucide-react';
import sql from '@/lib/db';
import { updateGitHubIssue } from '@/lib/github';
import { getContrastText } from '@/lib/textColor';

export const TaskConfigModal = ({ 
  isOpen, 
  onClose, 
  task, 
  projects, 
  columns, 
  onTaskUpdated, 
  onArchive,
  onDelete // <--- Receive Delete Function
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    description: '',
    priority: 'low',
    columnId: '',
    projectId: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        content: task.content,
        description: task.description || '',
        priority: task.priority || 'low',
        columnId: task.columnId || '',
        projectId: task.projectId || ''
      });
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const currentProject = projects.find(p => String(p.id) === String(formData.projectId)) || {};
  const projectColor = currentProject.color || task.project_color || '#94a3b8';
  const textColor = getContrastText(projectColor);

  const isDoneColumn = columns?.find(c => String(c.id) === String(formData.columnId))?.title.toLowerCase() === 'done';

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sql`
        UPDATE tasks 
        SET 
          content = ${formData.content}, 
          description = ${formData.description},
          priority = ${formData.priority},
          column_id = ${formData.columnId},
          project_id = ${formData.projectId}
        WHERE id = ${task.id}
      `;

      if (task.github_issue_number && task.github_repo) {
        await updateGitHubIssue(
          task.github_repo,
          task.github_issue_number,
          formData.content,
          formData.description
        );
      }

      onTaskUpdated();
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveClick = async () => {
    if (!confirm("Archive this task? It will be hidden from the board.")) return;
    const success = await onArchive(task.id);
    if (success) onClose();
  };

  const handleDelete = async () => {
    const confirmMessage = task.github_issue_number 
      ? `WARNING: This task is linked to GitHub Issue #${task.github_issue_number}.\n\nDeleting it here will NOT delete the issue on GitHub, but it will sever the link.\n\nAre you sure you want to delete this card?`
      : "Are you sure you want to delete this task forever?";

    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    const success = await onDelete(task.id);
    setLoading(false);
    
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-border dark:border-dark-border flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 flex justify-between items-start flex-shrink-0" style={{ backgroundColor: projectColor, color: textColor }}>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{currentProject.name || 'No Project'}</span>
            <h2 className="text-xl font-bold mt-1">Edit Task</h2>
          </div>
          <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity"><X size={24} /></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Title</label>
              <input 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border dark:border-dark-border rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
              <textarea 
                rows={8}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border dark:border-dark-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border dark:border-dark-border">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Layers size={12} /> Project</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border border-border dark:border-dark-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.projectId} onChange={(e) => setFormData({...formData, projectId: e.target.value})}>
                <option value="">No Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Calendar size={12} /> Status</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border border-border dark:border-dark-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.columnId} onChange={(e) => setFormData({...formData, columnId: e.target.value})}>
                {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Tag size={12} /> Priority</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border border-border dark:border-dark-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-border dark:border-dark-border flex justify-between gap-3 bg-slate-50 dark:bg-slate-800/50">
           
           <div className="flex items-center gap-2">
             {/* Archive Button (Done Column only) */}
             {isDoneColumn && (
               <button 
                 type="button"
                 onClick={handleArchiveClick}
                 className="px-3 py-2 text-sm font-bold text-amber-600 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-900/20 rounded-lg flex items-center gap-2 transition-colors"
               >
                 <Archive size={16} /> <span className="hidden sm:inline">Archive</span>
               </button>
             )}

             {/* Delete Button (Always Visible) */}
             <button 
               type="button"
               onClick={handleDelete}
               className="px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors"
               title="Delete permanently"
             >
               <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
             </button>
           </div>

           <div className="flex gap-3">
             <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
             <button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50">
               {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} Save
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};