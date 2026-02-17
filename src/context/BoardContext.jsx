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
    // We don't set loading(true) here to avoid flickering on re-fetches
    try {
      const [boardData, projectsData] = await Promise.all([
        api.getBoardData(),
        api.getProjects()
      ]);
      
      setColumns(processBoardData(boardData));
      setProjects(projectsData);
      
      // Init visibility if empty
      if (visibleProjects.size === 0) {
        setVisibleProjects(new Set(projectsData.map(p => String(p.id))));
      }
    } catch (error) {
      console.error("Context: Load Failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- 3. Public Actions ---
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

  const archiveTask = async (id) => {
    const success = await api.archiveTask(id);
    if (success) await loadData();
    return success;
  };

  const deleteTask = async (id) => {
    const success = await api.deleteTask(id);
    if (success) await loadData();
    return success;
  };

  const toggleProjectVisibility = (id) => {
    setVisibleProjects(prev => {
      const next = new Set(prev);
      const strId = String(id);
      next.has(strId) ? next.delete(strId) : next.add(strId);
      return next;
    });
  };

  // --- 4. Filtering ---
  const filteredColumns = useMemo(() => {
    return columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(task => visibleProjects.has(task.projectId))
    }));
  }, [columns, visibleProjects]);

  // Initial Load
  useEffect(() => { loadData(); }, [loadData]);

  const value = {
    columns: filteredColumns,
    rawColumns: columns,
    projects,
    visibleProjects,
    loading,
    isSyncing,
    isSaving,
    setColumns, // Exposed for Drag & Drop optimistic updates
    loadData,
    saveBoard,
    syncGitHubIssues,
    archiveTask,
    deleteTask,
    toggleProjectVisibility,
    closeGitHubIssue: api.closeGitHubIssue
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};