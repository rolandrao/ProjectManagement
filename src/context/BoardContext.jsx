import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/services/api';

const BoardContext = createContext();

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) throw new Error("useBoard must be used within a BoardProvider");
  return context;
};

export const BoardProvider = ({ children }) => {
  const [columns, setColumns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [visibleProjects, setVisibleProjects] = useState(new Set());
  
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- 1. Data Processing Helper ---
  const processBoardData = (data) => {
    const colMap = new Map();
    
    // Initialize Columns
    data.forEach(row => {
      if (!colMap.has(row.column_id)) {
        colMap.set(row.column_id, { 
          id: String(row.column_id), 
          title: row.column_title, 
          tasks: [] 
        });
      }
    });

    // Populate Tasks
    data.forEach(row => {
      if (row.task_id) {
        colMap.get(row.column_id).tasks.push({
          id: String(row.task_id),
          content: row.content,
          description: row.description || '',
          priority: row.priority,
          labels: row.labels || [],
          github_issue_number: row.github_issue_number,
          projectId: String(row.project_id),
          project_name: row.project_name,
          project_color: row.project_color,
          github_repo: row.github_repo,
          columnId: String(row.column_id)
        });
      }
    });
    return Array.from(colMap.values());
  };

  // --- 2. Fetchers ---
  const loadData = useCallback(async () => {
    try {
      // Fetch board and projects in parallel
      const [boardData, projectsData] = await Promise.all([
        api.getBoardData(),
        api.getProjects()
      ]);
      
      setColumns(processBoardData(boardData));
      setProjects(projectsData);
      
      // Initialize visibility on first load
      if (visibleProjects.size === 0) {
        setVisibleProjects(new Set(projectsData.map(p => String(p.id))));
      }
    } catch (error) {
      console.error("Context: Load Failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- 3. Board Actions ---
  const saveBoard = async (currentColumns) => {
    setIsSaving(true);
    try {
      const updates = [];
      currentColumns.forEach(col => {
        col.tasks.forEach((task, index) => {
          updates.push({ id: task.id, column_id: col.id, position: index });
        });
      });
      await api.saveBoardPositions(updates);
      return true;
    } catch (e) {
      alert("Failed to save.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const syncGitHubIssues = async () => {
    setIsSyncing(true);
    try {
      const count = await api.syncGitHub(projects);
      await loadData();
      alert(`Synced ${count} issues.`);
    } catch (e) {
      alert("Sync failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  // --- 4. Task Operations ---
  const archiveTask = async (id) => {
    const success = await api.archiveTask(id);
    if (success) await loadData(); // Task disappears from board
    return success;
  };

  const restoreTask = async (id) => {
    const success = await api.restoreTask(id);
    if (success) await loadData(); // Task reappears on board
    return success;
  };

  const deleteTask = async (id) => {
    // This is "Delete Forever"
    const success = await api.deleteTask(id);
    if (success) await loadData();
    return success;
  };

  // --- 5. Project Operations ---
  const updateProject = async (id, data) => {
    try {
      await api.updateProject(id, data);
      await loadData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteProject = async (id) => {
    try {
      await api.deleteProject(id);
      await loadData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const toggleProjectVisibility = (id) => {
    setVisibleProjects(prev => {
      const next = new Set(prev);
      const strId = String(id);
      next.has(strId) ? next.delete(strId) : next.add(strId);
      return next;
    });
  };

  // --- 6. Filtering ---
  const filteredColumns = useMemo(() => {
    return columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(task => visibleProjects.has(task.projectId))
    }));
  }, [columns, visibleProjects]);

  // Initial Load
  useEffect(() => { loadData(); }, [loadData]);

  const value = {
    // Data
    columns: filteredColumns,
    rawColumns: columns,
    projects,
    visibleProjects,
    loading,
    isSyncing,
    isSaving,
    
    // Setters
    setColumns, // Exposed for Drag & Drop optimistic updates
    
    // Core Actions
    loadData,
    saveBoard,
    syncGitHubIssues,
    
    // Entity Actions
    archiveTask,
    restoreTask, // <--- New
    deleteTask,  // <--- Acts as "Delete Forever"
    closeGitHubIssue: api.closeGitHubIssue,

    // Project Actions
    updateProject,
    deleteProject,
    toggleProjectVisibility
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};