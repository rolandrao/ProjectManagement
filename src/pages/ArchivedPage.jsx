import React, { useState, useEffect } from 'react';
import { ArrowLeft, Archive, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import sql from '@/lib/db';

export const ArchivedPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArchived = async () => {
    setLoading(true);
    try {
      const data = await sql`
        SELECT t.*, p.name as project_name, p.color as project_color 
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.is_archived = TRUE
        ORDER BY t.id DESC
      `;
      setTasks(data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchArchived(); }, []);

  const handleUnarchive = async (id) => {
    if(!confirm("Restore this task to the board?")) return;
    await sql`UPDATE tasks SET is_archived = FALSE WHERE id = ${id}`;
    fetchArchived();
  };

  const handleDeleteForever = async (id) => {
    if(!confirm("Delete forever? This cannot be undone.")) return;
    await sql`DELETE FROM tasks WHERE id = ${id}`;
    fetchArchived();
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 text-slate-800 dark:text-slate-200">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"><ArrowLeft size={24} /></Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Archive className="text-amber-500" /> Archived Tasks
            </h1>
            <p className="text-slate-500">History of completed work</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border dark:border-dark-border overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No archived tasks found.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-400 font-bold">
                <tr>
                  <th className="p-4">Task</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">GitHub</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4 font-medium">{task.content}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-md text-xs font-bold uppercase" style={{ backgroundColor: task.project_color + '33', color: task.project_color }}>
                        {task.project_name || 'No Project'}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm text-slate-500">
                       {task.github_issue_number ? `#${task.github_issue_number}` : '-'}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => handleUnarchive(task.id)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="Restore">
                        <RefreshCw size={18} />
                      </button>
                      <button onClick={() => handleDeleteForever(task.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete Forever">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};