import React, { useState } from 'react';
import { X, Github, Save, Loader2 } from 'lucide-react';
import sql from '@/lib/db';

export const AddProjectModal = ({ isOpen, onClose, onProjectAdded }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    github_repo: '' // e.g. "facebook/react"
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert into Neon
      await sql`
        INSERT INTO projects (name, color, github_repo)
        VALUES (${formData.name}, ${formData.color}, ${formData.github_repo})
      `;
      onProjectAdded();
      onClose();
      setFormData({ name: '', color: '#3b82f6', github_repo: '' });
    } catch (error) {
      console.error("Failed to add project:", error);
      alert("Error adding project. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          
          {/* Project Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project Name</label>
            <input 
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Finance App"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* GitHub Repo */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
               <Github size={12} /> Linked Repository
            </label>
            <input 
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="username/repo-name"
              value={formData.github_repo}
              onChange={e => setFormData({...formData, github_repo: e.target.value})}
            />
            <p className="text-[10px] text-slate-400 mt-1">Must be in format: <code>owner/repo</code></p>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Project Color</label>
            <div className="flex gap-3">
               {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'].map(color => (
                 <button
                   key={color}
                   type="button"
                   onClick={() => setFormData({...formData, color})}
                   className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${formData.color === color ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900' : ''}`}
                   style={{ backgroundColor: color }}
                 />
               ))}
            </div>
          </div>

          <button 
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
};