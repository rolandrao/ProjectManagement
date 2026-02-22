import sql from '@/lib/db';
import { fetchGitHubIssues, closeGitHubIssue, createGitHubIssue, fetchGitHubLabels } from '@/lib/github';

export const api = {
  // --- Projects ---
  async getProjects() {
    return await sql`SELECT * FROM projects ORDER BY name ASC`;
  },

  async updateProject(id, data) {
    return await sql`
      UPDATE projects 
      SET name = ${data.name}, color = ${data.color}, github_repo = ${data.github_repo}
      WHERE id = ${id}
    `;
  },

  async deleteProject(id) {
    return await sql`DELETE FROM projects WHERE id = ${id}`;
  },

  // --- Board Data ---
  async getBoardData() {
    return await sql`
      SELECT 
        c.id as column_id, c.title as column_title, c.position as column_position,
        t.id as task_id, t.content, t.description, t.priority, t.github_issue_number, 
        t.position as task_position, t.is_archived, t.labels,
        p.id as project_id, p.name as project_name, p.color as project_color, p.github_repo as github_repo
      FROM columns c
      LEFT JOIN tasks t ON c.id = t.column_id AND t.is_archived = FALSE
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE c.board_id = 1
      ORDER BY c.position ASC, t.position ASC
    `;
  },

  async getArchivedTasks() {
    return await sql`
      SELECT t.*, p.name as project_name, p.color as project_color 
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.is_archived = TRUE
      ORDER BY t.id DESC
    `;
  },

  // --- Task Operations ---
  
  // NEW: Create Task with GitHub auto-routing & dynamic Labels
  async createTask(data) {
    let finalIssueNumber = data.github_issue_number || null;
    let finalRepo = data.github_repo || null;
    let labelObjects = data.labels || []; // Array of objects: [{name: 'bug', color: 'd73a4a'}]

    // Auto-create on GitHub if no manual URL was provided but the project is linked
    if (!finalIssueNumber && finalRepo) {
        // GitHub API only wants the string names (e.g., ["bug", "frontend"])
        const labelNames = labelObjects.map(l => l.name);
        
        const newIssueNum = await createGitHubIssue(finalRepo, data.content, data.description, labelNames);
        if (newIssueNum) {
            finalIssueNumber = newIssueNum;
        }
    }

    // Insert into local DB: We stringify the full label objects so the board can render the colors!
    return await sql`
      INSERT INTO tasks (content, description, project_id, column_id, priority, github_issue_number, labels)
      VALUES (
        ${data.content}, 
        ${data.description}, 
        ${data.projectId}, 
        ${data.columnId}, 
        ${data.priority},
        ${finalIssueNumber},
        ${JSON.stringify(labelObjects)} 
      )
    `;
  },

  async updateTask(id, data) {
    return await sql`
      UPDATE tasks 
      SET 
        content = ${data.content}, 
        description = ${data.description},
        priority = ${data.priority},
        column_id = ${data.columnId},
        project_id = ${data.projectId}
      WHERE id = ${id}
    `;
  },

  async archiveTask(id) {
    return await sql`UPDATE tasks SET is_archived = TRUE WHERE id = ${id}`;
  },

  async restoreTask(id) {
    return await sql`UPDATE tasks SET is_archived = FALSE WHERE id = ${id}`;
  },

  async deleteTask(id) {
    return await sql`DELETE FROM tasks WHERE id = ${id}`;
  },

  // --- Batch Updates (Drag & Drop) ---
  async saveBoardPositions(updates) {
    const promises = updates.map(u => sql`
      UPDATE tasks 
      SET column_id = ${u.column_id}, position = ${u.position} 
      WHERE id = ${u.id}
    `);
    await Promise.all(promises);
    return true;
  },

  // --- GitHub Integrations ---
  
  // Expose the GitHub Labels fetcher to the UI
  async getGitHubLabels(repo) {
    return await fetchGitHubLabels(repo);
  },

  async closeGitHubIssue(repo, number) {
    try {
      await closeGitHubIssue(repo, number);
      return true;
    } catch (error) {
      console.error("API: Failed to close issue", error);
      return false;
    }
  },

  async syncGitHub(projects) {
    const linkedProjects = projects.filter(p => p.github_repo);
    let totalProcessed = 0;

    for (const project of linkedProjects) {
      const issues = await fetchGitHubIssues(project.github_repo);
      for (const issue of issues) {
        await sql`
          INSERT INTO tasks (content, description, project_id, column_id, github_issue_number, priority, labels)
          VALUES (
            ${issue.title}, 
            ${issue.body || ''}, 
            ${project.id}, 
            1, 
            ${issue.github_issue_number}, 
            'low',
            ${JSON.stringify(issue.labels)}
          )
          ON CONFLICT (project_id, github_issue_number) 
          DO UPDATE SET 
            content = EXCLUDED.content,
            description = EXCLUDED.description,
            labels = EXCLUDED.labels
        `;
        totalProcessed++;
      }
    }
    return totalProcessed;
  }
};