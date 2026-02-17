import React, { useState } from 'react';
import { Layers, Github, Edit2, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBoard } from '@/context/BoardContext';
import { ProjectSettingsModal } from '@/components/board/ProjectSettingsModal';
import { AddProjectModal } from '@/components/board/AddProjectModal';

export const SettingsPage = () => {
  const { projects, loading } = useBoard();
  
  // Modal State
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleEditClick = (project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  if (loading) return null;

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 overflow-y-auto pb-32">
      
      {/* Header (Safe Area Aware) */}
      <div className="pt-[calc(env(safe-area-inset-top)+2rem)] px-6 md:px-10 pb-6">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
           <Link to="/" className="hover:text-blue-500 transition-colors"><ArrowLeft size={16} /></Link>
           <span className="text-xs font-bold uppercase tracking-widest">Configuration</span>
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 text-sm"
          >
            <Plus size={18} /> <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {projects.map((project) => (
          <div 
            key={project.id}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Project Color Indicator */}
            <div 
                className="absolute top-5 right-5 w-3 h-3 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-800"
                style={{ backgroundColor: project.color }}
            />

            <div className="flex flex-col h-full justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                      <Layers size={20} />
                   </div>
                   <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 line-clamp-1">
                     {project.name}
                   </h3>
                </div>
                
                {/* GitHub Status Pill */}
                {project.github_repo ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-800/50">
                    <Github size={12} />
                    <span className="truncate max-w-[150px]">{project.github_repo}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 text-xs font-bold">
                    Local Only
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <button 
                onClick={() => handleEditClick(project)}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-sm transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10"
              >
                <Edit2 size={14} /> Manage Settings
              </button>
            </div>
          </div>
        ))}

        {/* Empty State / Add New Card */}
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex flex-col items-center justify-center gap-3 min-h-[160px] rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
            <Plus size={24} />
          </div>
          <span className="font-bold text-slate-500 group-hover:text-blue-600">Create Project</span>
        </button>

      </div>

      {/* Modals */}
      <ProjectSettingsModal 
        isOpen={isEditModalOpen} 
        project={selectedProject} 
        onClose={() => { setIsEditModalOpen(false); setSelectedProject(null); }} 
        onProjectUpdated={() => { window.location.reload(); }} 
      />

      <AddProjectModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProjectAdded={() => { window.location.reload(); }}
      />
    </div>
  );
};