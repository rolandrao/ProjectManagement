import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Tag, Layers, Github, Hash } from 'lucide-react';
import { api } from '@/services/api'; 

export const AddTaskModal = ({ isOpen, onClose, projects, columns, onTaskAdded }) => {
  const [loading, setLoading] = useState(false);
  const [loadingLabels, setLoadingLabels] = useState(false);
  const [availableLabels, setAvailableLabels] = useState([]);
  
  const [formData, setFormData] = useState({
    content: '',
    description: '',
    priority: 'low',
    columnId: columns[0]?.id || '', 
    projectId: projects[0]?.id || '',
    githubIssueUrl: '',
    labels: [] // Now stores an array of label objects
  });

  // --- NEW: Fetch Labels when Project Changes ---
  useEffect(() => {
    const fetchLabels = async () => {
      const selectedProject = projects.find(p => String(p.id) === String(formData.projectId));
      
      if (selectedProject?.github_repo) {
        setLoadingLabels(true);
        const labels = await api.getGitHubLabels(selectedProject.github_repo);
        setAvailableLabels(labels);
        setLoadingLabels(false);
      } else {
        setAvailableLabels([]);
      }
      
      // Clear selected labels when switching projects
      setFormData(prev => ({ ...prev, labels: [] }));
    };

    if (isOpen) {
      fetchLabels();
    }
  }, [formData.projectId, projects, isOpen]);

  if (!isOpen) return null;

  const toggleLabel = (labelObj) => {
    setFormData(prev => {
      const exists = prev.labels.find(l => l.name === labelObj.name);
      if (exists) {
        return { ...prev, labels: prev.labels.filter(l => l.name !== labelObj.name) };
      } else {
        return { ...prev, labels: [...prev.labels, labelObj] };
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.content) return;
    
    setLoading(true);
    try {
      const selectedProject = projects.find(p => String(p.id) === String(formData.projectId));
      let issueNumber = null;
      let repo = selectedProject?.github_repo || null; 
      
      if (formData.githubIssueUrl) {
          const match = formData.githubIssueUrl.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
          if (match) {
             repo = `${match[1]}/${match[2]}`;
             issueNumber = parseInt(match[3]);
          }
      }

      await api.createTask({
          content: formData.content,
          description: formData.description,
          projectId: formData.projectId,
          columnId: formData.columnId,
          priority: formData.priority,
          github_repo: repo,
          github_issue_number: issueNumber,
          labels: formData.labels // Pass the array of full objects
      });

      onTaskAdded();
      onClose();
      setFormData({ content: '', description: '', priority: 'low', columnId: columns[0]?.id || '', projectId: projects[0]?.id || '', githubIssueUrl: '', labels: [] });
    } catch (error) {
      console.error("Failed to add task:", error);
      alert("Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full md:w-[600px] bg-white dark:bg-slate-900 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-5 duration-200">
        
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">New Task</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">
          
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

          <div className="grid grid-cols-2 gap-4">
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

          {/* --- NEW: Interactive GitHub Labels --- */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                <Hash size={12} /> GitHub Labels
            </label>
            
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 min-h-[60px]">
              {loadingLabels ? (
                 <div className="flex items-center gap-2 text-slate-400 text-sm">
                   <Loader2 size={14} className="animate-spin" /> Fetching labels...
                 </div>
              ) : availableLabels.length > 0 ? (
                 <div className="flex flex-wrap gap-2">
                   {availableLabels.map((label) => {
                     const isSelected = formData.labels.some(l => l.name === label.name);
                     const bgColor = String(label.color).startsWith('#') ? label.color : `#${label.color}`;
                     
                     return (
                       <button
                         key={label.name}
                         type="button"
                         onClick={() => toggleLabel(label)}
                         className={`px-3 py-1 text-xs font-bold rounded-full border-2 transition-all ${
                           isSelected 
                             ? 'opacity-100 scale-105 shadow-sm' 
                             : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100 border-transparent'
                         }`}
                         style={{ 
                           backgroundColor: isSelected ? bgColor : 'transparent',
                           borderColor: isSelected ? bgColor : 'transparent',
                           color: isSelected ? '#fff' : '#64748b' // Slate 500
                         }}
                         title={label.description}
                       >
                         {label.name}
                       </button>
                     );
                   })}
                 </div>
              ) : (
                 <div className="text-xs text-slate-400 italic">
                    No labels found or project is not linked to GitHub.
                 </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 hidden">
             {/* Hidden manual override if you still want it, but usually not needed anymore */}
             <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                <Github size={12} /> Link Existing Issue (Optional)
             </label>
             <input 
               placeholder="https://github.com/owner/repo/issues/123"
               className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
               value={formData.githubIssueUrl}
               onChange={e => setFormData({...formData, githubIssueUrl: e.target.value})}
             />
          </div>

        </form>

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