import React, { useState, useEffect } from 'react';
import { Save, Trash2, Github, Loader2, ArrowLeft, Layers, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import sql from '@/lib/db';

export const SettingsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // Fetch projects on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await sql`SELECT * FROM projects ORDER BY id ASC`;
        setProjects(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Handle Input Changes
  const handleChange = (id, field, value) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  // Save Changes to DB
  const handleSave = async (project) => {
    setSavingId(project.id);
    try {
      await sql`
        UPDATE projects 
        SET name = ${project.name}, github_repo = ${project.github_repo}, color = ${project.color}
        WHERE id = ${project.id}
      `;
      // Optional: Add a toast notification here
    } catch (e) {
      alert("Failed to save changes");
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  // Delete Project
  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This will delete the project and ALL associated tasks.")) return;
    
    try {
      await sql`DELETE FROM projects WHERE id = ${id}`;
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      alert("Failed to delete project");
      console.error(e);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 text-slate-800 dark:text-slate-200 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your workspace and project configurations</p>
          </div>
        </div>

        {/* Projects Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layers className="text-blue-500" /> 
              Project Configuration
            </h2>
            <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
              {projects.length} Active Projects
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {projects.map(project => (
              <div key={project.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                
                {/* Color Picker (Simple) */}
                <div className="flex-shrink-0">
                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Color</label>
                  <input 
                    type="color" 
                    value={project.color}
                    onChange={(e) => handleChange(project.id, 'color', e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                </div>

                {/* Main Inputs */}
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Project Name</label>
                    <input 
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      value={project.name}
                      onChange={(e) => handleChange(project.id, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block flex items-center gap-1">
                      <Github size={10} /> GitHub Repo
                    </label>
                    <input 
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                      value={project.github_repo || ''}
                      placeholder="owner/repo"
                      onChange={(e) => handleChange(project.id, 'github_repo', e.target.value)}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center mt-2 md:mt-0">
                  <button 
                    onClick={() => handleSave(project)}
                    disabled={savingId === project.id}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Save Changes"
                  >
                    {savingId === project.id ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

              </div>
            ))}

            {projects.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                No projects found. Go back to the board to add one!
              </div>
            )}
          </div>
        </section>

        {/* Danger Zone / Other Prefs Placeholder */}
        <section className="mt-8 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 bg-red-50/50 dark:bg-red-900/10">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-2">
            <AlertTriangle size={20} />
            <h3 className="font-bold">Danger Zone</h3>
          </div>
          <p className="text-sm text-red-500/80 mb-4">
            These actions are irreversible. Proceed with caution.
          </p>
          <button 
            onClick={() => confirm("Reset entire database?") && alert("Just kidding, feature not implemented yet!")}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-500 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors"
          >
            Reset All Data
          </button>
        </section>

      </div>
    </div>
  );
};