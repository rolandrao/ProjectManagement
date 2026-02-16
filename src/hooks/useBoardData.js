import { useState, useEffect, useCallback, useMemo } from 'react';
import sql from '@/lib/db';
import { fetchGitHubIssues, closeGitHubIssue as apiCloseIssue } from '@/lib/github';

export const useBoardData = () => {
  const [columns, setColumns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [visibleProjects, setVisibleProjects] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- 1. Fetch Projects ---
  const fetchProjects = useCallback(async () => {
    try {
      const data = await sql`SELECT * FROM projects ORDER BY name ASC`;
      setProjects(data);
      // Initialize visibility: All projects on by default if set is empty
      setVisibleProjects(new Set(data.map(p => String(p.id))));
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  }, []);

  // --- 2. Fetch Board Data (Includes Labels) ---
  const fetchBoardData = useCallback(async () => {
    try {
      const data = await sql`
        SELECT 
          c.id as column_id, 
          c.title as column_title, 
          t.id as task_id, 
          t.content, 
          t.description, 
          t.priority, 
          t.github_issue_number, 
          t.position,
          t.is_archived,
          t.labels, -- Fetch the labels JSONB
          p.id as project_id, 
          p.name as project_name, 
          p.color as project_color, 
          p.github_repo as github_repo
        FROM columns c
        LEFT JOIN tasks t ON c.id = t.column_id AND t.is_archived = FALSE
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE c.board_id = 1
        ORDER BY c.position ASC, t.position ASC
      `;
      
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
            labels: row.labels || [], // Ensure labels array exists
            github_issue_number: row.github_issue_number,
            projectId: String(row.project_id),
            project_name: row.project_name,
            project_color: row.project_color,
            github_repo: row.github_repo,
            columnId: String(row.column_id)
          });
        }
      });
      setColumns(Array.from(colMap.values()));
    } catch (err) {
      console.error("Error fetching board:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- 3. Archive Task ---
  const archiveTask = async (taskId) => {
    try {
      await sql`UPDATE tasks SET is_archived = TRUE WHERE id = ${taskId}`;
      await fetchBoardData(); 
      return true;
    } catch (error) {
      console.error("Failed to archive:", error);
      return false;
    }
  };

  // --- 4. Close GitHub Issue Wrapper ---
  const closeGitHubIssue = async (repo, number) => {
    try {
      await apiCloseIssue(repo, number);
      return true;
    } catch (error) {
      console.error("GitHub Close Failed:", error);
      return false;
    }
  };

  // --- 5. Batch Save ---
  const saveBoard = async (currentColumns) => {
    setIsSaving(true);
    try {
      const updates = [];
      for (const column of currentColumns) {
        column.tasks.forEach((task, index) => {
          updates.push(sql`
            UPDATE tasks 
            SET column_id = ${column.id}, position = ${index}
            WHERE id = ${task.id}
          `);
        });
      }
      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error("Batch save failed:", error);
      alert("Failed to save changes.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // --- 6. Sync GitHub Issues (Includes Labels) ---
  const syncGitHubIssues = async () => {
    setIsSyncing(true);
    try {
      const linkedProjects = await sql`SELECT id, github_repo FROM projects WHERE github_repo IS NOT NULL`;
      let totalProcessed = 0;

      for (const project of linkedProjects) {
        const issues = await fetchGitHubIssues(project.github_repo);
        
        for (const issue of issues) {
          await sql`
            INSERT INTO tasks (
              content, 
              description, 
              project_id, 
              column_id, 
              github_issue_number, 
              priority,
              labels -- Insert labels column
            )
            VALUES (
              ${issue.title}, 
              ${issue.body || ''}, 
              ${project.id}, 
              1, 
              ${issue.github_issue_number}, 
              'low',
              ${JSON.stringify(issue.labels)} -- Save labels as JSON
            )
            ON CONFLICT (project_id, github_issue_number) 
            DO UPDATE SET 
              content = EXCLUDED.content,
              description = EXCLUDED.description,
              labels = EXCLUDED.labels -- Update labels if they changed on GitHub
          `;
          totalProcessed++;
        }
      }
      
      await fetchBoardData();
      alert(`Sync Complete! Processed ${totalProcessed} items.`);
    } catch (error) {
      console.error("Sync failed:", error);
      alert("GitHub Sync failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  // --- 7. Visibility Filter ---
  const filteredColumns = useMemo(() => {
    return columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(task => visibleProjects.has(task.projectId))
    }));
  }, [columns, visibleProjects]);

  const toggleProjectVisibility = (projectId) => {
    setVisibleProjects(prev => {
      const next = new Set(prev);
      const idStr = String(projectId);
      next.has(idStr) ? next.delete(idStr) : next.add(idStr);
      return next;
    });
  };

  useEffect(() => {
    fetchBoardData();
    fetchProjects();
  }, [fetchBoardData, fetchProjects]);

  return { 
    columns: filteredColumns, 
    rawColumns: columns, 
    setColumns, 
    projects, 
    visibleProjects,
    toggleProjectVisibility,
    loading, 
    isSyncing, 
    isSaving,
    saveBoard,
    archiveTask,
    closeGitHubIssue,
    fetchBoardData, 
    fetchProjects, 
    syncGitHubIssues 
  };
};