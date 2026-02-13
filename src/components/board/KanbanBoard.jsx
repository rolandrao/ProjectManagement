import React from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';

// A reusable "Glass" column component
const GlassColumn = ({ title, tasks }) => (
  <div className="w-80 flex-shrink-0 flex flex-col gap-4">
    {/* Column Header */}
    <div className="flex items-center justify-between px-2">
      <h3 className="font-semibold text-slate-700">{title}</h3>
      <button className="p-1 hover:bg-black/5 rounded-full transition-colors">
        <MoreHorizontal size={18}/>
      </button>
    </div>

    {/* The Column Container (Glass Effect) */}
    <div className={`
      p-4 rounded-3xl min-h-[500px]
      bg-glass-100 backdrop-blur-md border border-white/40 shadow-sm
    `}>
      {tasks.map((task) => (
        <div key={task.id} className="bg-white p-4 rounded-2xl shadow-sm mb-3 border border-white/50 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group">
          
          {/* Tags */}
          <div className="flex gap-2 mb-2">
            {task.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-bold px-2 py-1 rounded-full bg-accent-purpleLight text-accent-purple uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
          
          <p className="font-medium text-slate-800 mb-3">{task.title}</p>
          
          {/* Footer of card */}
          <div className="flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400"></div>
            <span className="text-xs text-slate-400">Feb 12</span>
          </div>
        </div>
      ))}

      {/* Add Button */}
      <button className="w-full py-3 mt-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-accent-purple hover:text-accent-purple transition-colors flex items-center justify-center gap-2">
        <Plus size={18} /> Add Task
      </button>
    </div>
  </div>
);

export const KanbanBoard = () => {
  // Dummy data
  const todo = [
    { id: 1, title: "Design System Draft", tags: ["Design"] },
    { id: 2, title: "Competitor Analysis", tags: ["Research"] },
  ];
  const inProgress = [
    { id: 3, title: "Setup Neon Database", tags: ["Dev", "Backend"] },
  ];

  return (
    <div className="h-full w-full overflow-x-auto p-4">
      {/* Top Header Floating */}
      <header className="mb-8 flex justify-between items-center pl-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Product Roadmap</h1>
          <p className="text-slate-500">Q1 2024 Goals</p>
        </div>
        
        <div className="flex gap-3">
             <button className="bg-white px-6 py-2 rounded-full font-medium shadow-sm text-slate-600 hover:bg-slate-50 transition-colors">Filter</button>
             <button className="bg-accent-navy text-white px-6 py-2 rounded-full font-medium shadow-lg hover:bg-slate-800 transition-colors">Create Board</button>
        </div>
      </header>

      {/* Board Area */}
      <div className="flex gap-8 pb-10">
        <GlassColumn title="To Do" tasks={todo} />
        <GlassColumn title="In Progress" tasks={inProgress} />
        <GlassColumn title="Done" tasks={[]} />
      </div>
    </div>
  );
};