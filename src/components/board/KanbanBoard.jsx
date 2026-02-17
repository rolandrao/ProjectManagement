import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Loader2, RefreshCw, Plus, Settings2, Check, Save, Layers, X } from 'lucide-react';

import { useBoard } from '@/context/BoardContext';
import { SolidColumn } from './SolidColumn';
import { AddProjectModal } from './AddProjectModal';
import { ProjectSettingsModal } from './ProjectSettingsModal';
import { TaskConfigModal } from './TaskConfigModal';
import { AddTaskModal } from './AddTaskModal';

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
    deleteTask,
    closeGitHubIssue,
    loadData, 
    syncGitHubIssues 
  } = useBoard();
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Modals State
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [configTask, setConfigTask] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);

  // --- Drag & Drop Logic ---
  const onDragEnd = async (result) => {
    const { destination, source } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startCol = columns.find(c => c.id === source.droppableId);
    const finishCol = columns.find(c => c.id === destination.droppableId);

    if (!startCol || !finishCol) return;

    // Detect "Done" Drop
    if (finishCol.title.toLowerCase() === 'done' && startCol.title.toLowerCase() !== 'done') {
       const task = startCol.tasks[source.index];
       if (task.github_issue_number && task.github_repo) {
          if (window.confirm(`Close GitHub Issue #${task.github_issue_number}?`)) {
             await closeGitHubIssue(task.github_repo, task.github_issue_number);
          }
       }
    }

    setHasUnsavedChanges(true);

    if (startCol === finishCol) {
      const newTasks = Array.from(startCol.tasks);
      const [movedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, movedTask);

      setColumns(prev => prev.map(c => c.id === startCol.id ? { ...c, tasks: newTasks } : c));
    } else {
      const startTasks = Array.from(startCol.tasks);
      const [movedTask] = startTasks.splice(source.index, 1);
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

  const handleSyncOrSave = () => {
    if (hasUnsavedChanges) {
      handleManualSave();
    } else {
      syncGitHubIssues();
    }
  };

  if (loading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 relative">
        
        {/* --- Header (Safe Area Aware) --- */}
        <header className="
            flex-shrink-0 
            pt-[calc(env(safe-area-inset-top)+1rem)] pb-2 px-4 md:px-8 
            bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md z-10 sticky top-0 md:static 
            flex justify-between items-center border-b border-transparent md:border-slate-200 md:dark:border-slate-800
        ">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Roadmap</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium md:hidden">
                 {hasUnsavedChanges ? 'Unsaved changes' : 'All systems go'}
              </p>
            </div>
            {/* Desktop Actions (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-3">
               <button onClick={handleSyncOrSave} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold">Sync</button>
               <button onClick={() => setIsAddProjectModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">New Project</button>
            </div>
        </header>

        {/* --- Board Area --- */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth pb-0 md:pb-4 px-0 md:px-8">
          <div className="flex h-full gap-0 md:gap-6">
            {columns.map(col => (
              <div key={col.id} className="snap-center flex-shrink-0 h-full w-full md:w-80 px-4 md:px-0">
                  <SolidColumn 
                    column={col} 
                    tasks={col.tasks} 
                    onTaskClick={(e, task) => { setConfigTask(task); setIsConfigOpen(true); }} 
                  />
              </div>
            ))}
          </div>
        </div>

        {/* --- MOBILE FLOATING CONTROLS (Safe Area Aware) --- */}
        <div className="
            fixed bottom-[calc(env(safe-area-inset-bottom)+6rem)] right-6 z-40 
            flex flex-col items-end gap-3 md:hidden pointer-events-none
        ">
            
            {/* 1. PROJECT LIST (Expands Upwards) */}
            <div className={`
                flex flex-col gap-3 items-end transition-all duration-300 origin-bottom
                ${isProjectMenuOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}
            `}>
                
                {/* Add Project Button */}
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded shadow-sm backdrop-blur">New Project</span>
                    <button 
                        onClick={() => { setIsAddProjectModalOpen(true); setIsProjectMenuOpen(false); }}
                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 shadow-lg flex items-center justify-center border border-slate-200 dark:border-slate-700"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {/* Project List */}
                {projects.map(p => {
                    const isVisible = visibleProjects.has(String(p.id));
                    return (
                        <div key={p.id} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-500 bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded shadow-sm backdrop-blur">
                                {p.name}
                            </span>
                            <button
                                onClick={() => toggleProjectVisibility(p.id)}
                                className={`
                                    w-10 h-10 rounded-full shadow-lg flex items-center justify-center border-2 transition-all
                                    ${isVisible ? 'border-white dark:border-slate-700' : 'border-transparent opacity-50 grayscale'}
                                `}
                                style={{ backgroundColor: p.color }}
                            >
                                {isVisible && <Check size={16} className="text-white drop-shadow-md" />}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* 2. PROJECT TOGGLE BUTTON */}
            <button 
                onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                className={`
                    w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all pointer-events-auto
                    ${isProjectMenuOpen ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-white' : 'bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-400'}
                `}
            >
                {isProjectMenuOpen ? <X size={20} /> : <Layers size={20} />}
            </button>

            {/* 3. SYNC / SAVE BUTTON (Dynamic) */}
            <button 
                onClick={handleSyncOrSave}
                disabled={isSyncing || isSaving}
                className={`
                    w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all pointer-events-auto
                    ${hasUnsavedChanges 
                        ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                        : 'bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-400'}
                `}
            >
                {isSaving || isSyncing ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : hasUnsavedChanges ? (
                    <Save size={20} />
                ) : (
                    <RefreshCw size={20} />
                )}
            </button>

            {/* 4. NEW TASK BUTTON (Primary) */}
            <button 
                onClick={() => setIsAddTaskModalOpen(true)} 
                className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center active:scale-90 transition-transform pointer-events-auto"
            >
                <Plus size={28} />
            </button>
        </div>

        {/* Desktop Add Task Button (Visible only on md+) */}
        <div className="hidden md:block fixed bottom-8 right-8 z-40">
             <button 
                 onClick={() => setIsAddTaskModalOpen(true)}
                 className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
             >
                 <Plus size={20} /> New Task
             </button>
        </div>

        {/* --- Modals --- */}
        <AddTaskModal 
           isOpen={isAddTaskModalOpen}
           onClose={() => setIsAddTaskModalOpen(false)}
           projects={projects}
           columns={columns}
           onTaskAdded={loadData}
        />

        <AddProjectModal 
            isOpen={isAddProjectModalOpen} 
            onClose={() => setIsAddProjectModalOpen(false)} 
            onProjectAdded={loadData} 
        />
        
        <ProjectSettingsModal 
            isOpen={isSettingsOpen} 
            project={selectedProject} 
            onClose={() => { setIsSettingsOpen(false); setSelectedProject(null); }} 
            onProjectUpdated={loadData} 
        />
        
        <TaskConfigModal 
          isOpen={isConfigOpen} 
          task={configTask} 
          projects={projects}
          columns={columns}
          onClose={() => { setIsConfigOpen(false); setConfigTask(null); }} 
          onTaskUpdated={loadData} 
          onArchive={archiveTask}
          onDelete={deleteTask}
        />
      </div>
    </DragDropContext>
  );
};