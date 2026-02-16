import React, { useState, useEffect } from 'react';
import { X, Github, Save, Loader2, Trash2 } from 'lucide-react';
import sql from '@/lib/db';

export const ProjectSettingsModal = ({ isOpen, onClose, project, onProjectUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    github_repo: ''
  });

  // Load project data when the modal opens
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        color: project.color,
        github_repo: project.github_repo || ''
      });
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sql`
        UPDATE projects 
        SET name = ${formData.name}, color = ${formData.color}, github_repo = ${formData.github_repo}
        WHERE id = ${project.id}
      `;
      onProjectUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to update project:", error);
      alert("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${project.name}"? All associated tasks will be unlinked.`)) return;
    
    try {
      await sql`DELETE FROM projects WHERE id = ${project.id}`;
      onProjectUpdated();
      onClose();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-bg-card dark:bg-dark-bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border dark:border-dark-border overflow-hidden">
        
        <div className="flex justify-between items-center p-4 border-b border-border dark:border-dark-border">
          <h2 className="text-lg font-bold">Project Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleUpdate} className="p-6 flex flex-col gap-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Project Name</label>
            <input 
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-border dark:border-dark-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
               <Github size={12} /> GitHub Repo (owner/repo)
            </label>
            <input 
              className="w-full bg-slate-50 dark:bg-slate-900 border border-border dark:border-dark-border rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.github_repo}
              onChange={e => setFormData({...formData, github_repo: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Theme Color</label>
            <div className="flex flex-wrap gap-2">
               {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#06b6d4'].map(color => (
                 <button
                   key={color}
                   type="button"
                   onClick={() => setFormData({...formData, color})}
                   className={`w-8 h-8 rounded-lg transition-all ${formData.color === color ? 'ring-2 ring-blue-500 scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'}`}
                   style={{ backgroundColor: color }}
                 />
               ))}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button 
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Trash2 size={18} /> Delete
            </button>
            <button 
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};