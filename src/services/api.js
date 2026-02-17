import sql from '@/lib/db';
import { fetchGitHubIssues, closeGitHubIssue } from '@/lib/github';

export const api = {
  // --- Projects ---
  async getProjects() {
    return await sql`SELECT * FROM projects ORDER BY name ASC`;
  },

  async updateProject(id, data) {
    // data = { name, color, github_repo }
    return await sql`
      UPDATE projects 
      SET name = ${data.name}, color = ${data.color}, github_repo = ${data.github_repo}
      WHERE id = ${id}
    `;
  },

  async deleteProject(id) {
    // Hard delete a project
    return await sql`DELETE FROM projects WHERE id = ${id}`;
  },

  // --- Board Data (Active Tasks Only) ---
  async getBoardData() {
    // Fetches columns, active tasks (not archived), and joined project data
    return await sql`
      SELECT 
        c.id as column_id, 
        c.title as column_title, 
        c.position as column_position,
        t.id as task_id, 
        t.content, 
        t.description, 
        t.priority, 
        t.github_issue_number, 
        t.position as task_position,
        t.is_archived,
        t.labels,
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
  },

  // --- Archive Data (Inactive Tasks) ---
  async getArchivedTasks() {
    return await sql`
      SELECT 
        t.*, 
        p.name as project_name, 
        p.color as project_color 
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.is_archived = TRUE
      ORDER BY t.id DESC
    `;
  },

  // --- Task Operations ---
  async updateTask(id, data) {
    // data = { content, description, priority, columnId, projectId }
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
    // Soft delete: Hide from board, move to archive list
    return await sql`UPDATE tasks SET is_archived = TRUE WHERE id = ${id}`;
  },

  async restoreTask(id) {
    // Un-archive: Move back to board
    return await sql`UPDATE tasks SET is_archived = FALSE WHERE id = ${id}`;
  },

  async deleteTask(id) {
    // Hard delete: Remove from DB entirely (Used on board or archive page)
    return await sql`DELETE FROM tasks WHERE id = ${id}`;
  },

  // --- Batch Updates (Drag & Drop) ---
  async saveBoardPositions(updates) {
    // updates = Array of { id, column_id, position }
    const promises = updates.map(u => sql`
      UPDATE tasks 
      SET column_id = ${u.column_id}, position = ${u.position} 
      WHERE id = ${u.id}
    `);
    await Promise.all(promises);
    return true;
  },

  // --- GitHub Integrations ---
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