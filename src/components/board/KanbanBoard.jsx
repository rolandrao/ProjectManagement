import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Loader2, Search, RefreshCw, Plus, Settings2, Eye, EyeOff, Save } from 'lucide-react';

// Modular Component Imports
import { SolidColumn } from './SolidColumn';
import { AddProjectModal } from './AddProjectModal';
import { ProjectSettingsModal } from './ProjectSettingsModal';
import { TaskConfigModal } from './TaskConfigModal';
import { useBoardData } from '@/hooks/useBoardData';

export const KanbanBoard = () => {
  const { 
    columns, 
    setColumns, 
    projects, 
    visibleProjects,
    toggleProjectVisibility,
    loading, 
    isSyncing, 
    isSaving,
    saveBoard,
    archiveTask,
    closeGitHubIssue, // Import the close function
    fetchBoardData, 
    fetchProjects, 
    syncGitHubIssues 
  } = useBoardData();
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [configTask, setConfigTask] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // --- Drag Logic ---
  const onDragEnd = async (result) => {
    const { destination, source } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startCol = columns.find(c => c.id === source.droppableId);
    const finishCol = columns.find(c => c.id === destination.droppableId);

    if (!startCol || !finishCol) return;

    // --- DETECT "DONE" DROP ---
    // Check if moving TO "Done" from somewhere else
    if (finishCol.title.toLowerCase() === 'done' && startCol.title.toLowerCase() !== 'done') {
       const task = startCol.tasks[source.index];
       
       if (task.github_issue_number && task.github_repo) {
          const confirmClose = window.confirm(
             `This task is linked to GitHub Issue #${task.github_issue_number}.\n\nDo you want to close the issue on GitHub?`
          );

          if (confirmClose) {
             const success = await closeGitHubIssue(task.github_repo, task.github_issue_number);
             if (success) alert(`Issue #${task.github_issue_number} marked as completed on GitHub.`);
          }
       }
    }

    // --- Standard Move Logic ---
    setHasUnsavedChanges(true);

    if (startCol === finishCol) {
      const newTasks = Array.from(startCol.tasks);
      const [movedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, movedTask);

      setColumns(prev => prev.map(c => 
        c.id === startCol.id ? { ...c, tasks: newTasks } : c
      ));
    } else {
      const startTasks = Array.from(startCol.tasks);
      const [movedTask] = startTasks.splice(source.index, 1);
      
      // Update internal columnId immediately so modal shows correct status
      const updatedTask = { ...movedTask, columnId: destination.droppableId };
      
      const finishTasks = Array.from(finishCol.tasks);
      finishTasks.splice(destination.index, 0, updatedTask);

      setColumns(prev => prev.map(c => {
        if (c.id === startCol.id) return { ...c, tasks: startTasks };
        if (c.id === finishCol.id) return { ...c, tasks: finishTasks };
        return c;
      }));
    }
  };

  const handleManualSave = async () => {
    const success = await saveBoard(columns);
    if (success) setHasUnsavedChanges(false);
  };

  const handleTaskClick = (e, task) => {
    setConfigTask(task);
    setIsConfigOpen(true);
  };

  if (loading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col h-full w-full px-4 md:px-8 py-6">
        
        {/* --- Project Visibility Bar --- */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Visibility:</span>
          {projects.map(p => {
            const isVisible = visibleProjects.has(String(p.id));
            return (
              <div key={p.id} className="flex items-center gap-1 group">
                <button
                  onClick={() => toggleProjectVisibility(p.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-semibold whitespace-nowrap ${isVisible ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 border-transparent opacity-40 grayscale-[0.5]'}`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isVisible ? p.color : '#94a3b8' }} />
                  {p.name}
                  {isVisible ? <Eye size={12} className="ml-1 opacity-40"/> : <EyeOff size={12} className="ml-1 opacity-40"/>}
                </button>
                <button onClick={() => { setSelectedProject(p); setIsSettingsOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  <Settings2 size={14} />
                </button>
              </div>
            );
          })}
          <button onClick={() => setIsAddModalOpen(true)} className="p-1.5 rounded-full border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-blue-500 transition-colors ml-2"><Plus size={16} /></button>
        </div>

        {/* --- Header --- */}
        <header className="flex justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Product Roadmap</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Global View</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={handleManualSave}
               disabled={!hasUnsavedChanges || isSaving}
               className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${hasUnsavedChanges ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'}`}
             >
               {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
               {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
             </button>

             <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

             <button onClick={syncGitHubIssues} disabled={isSyncing} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-800" title="Sync from GitHub">
               <RefreshCw size={20} className={isSyncing ? "animate-spin text-blue-600" : ""} />
             </button>
             <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95 text-sm">+ New Task</button>
          </div>
        </header>

        {/* --- Board --- */}
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 h-full min-w-max pr-6">
            {columns.map(col => (
              <SolidColumn 
                key={col.id} 
                column={col} 
                tasks={col.tasks} 
                onTaskClick={handleTaskClick} 
              />
            ))}
          </div>
        </div>

        {/* --- Modals --- */}
        <AddProjectModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onProjectAdded={() => { fetchBoardData(); fetchProjects(); }} />
        <ProjectSettingsModal isOpen={isSettingsOpen} project={selectedProject} onClose={() => { setIsSettingsOpen(false); setSelectedProject(null); }} onProjectUpdated={() => { fetchBoardData(); fetchProjects(); }} />
        
        {/* Task Config Modal with Archive Capability */}
        <TaskConfigModal 
          isOpen={isConfigOpen} 
          task={configTask} 
          projects={projects}
          columns={columns}
          onClose={() => { setIsConfigOpen(false); setConfigTask(null); }} 
          onTaskUpdated={fetchBoardData} 
          onArchive={archiveTask} // Pass the archive function
        />
      </div>
    </DragDropContext>
  );
};