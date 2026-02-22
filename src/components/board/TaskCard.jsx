import React from 'react';
import { Github, AlignLeft, GripHorizontal } from 'lucide-react'; 

export const TaskCard = ({ task, onTaskClick, dragHandleProps }) => {
  
  // Ensure we have a standard 6-digit hex color
  const normalizeHex = (hex) => {
    if (!hex) return '#cbd5e1'; // Fallback slate color
    let clean = hex.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    return `#${clean}`;
  };

  const projectHex = normalizeHex(task.project_color);
  
  // --- Smart Contrast Checker ---
  // Returns white text for dark backgrounds, and dark text for light backgrounds
  const getTextColorClass = (hex) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substr(0, 2), 16) || 0;
    const g = parseInt(clean.substr(2, 2), 16) || 0;
    const b = parseInt(clean.substr(4, 2), 16) || 0;
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? 'text-slate-900' : 'text-white';
  };

  const textColor = getTextColorClass(projectHex);
  const mutedTextColor = textColor === 'text-white' ? 'text-white/80' : 'text-slate-900/70';

  return (
    <div 
      onClick={(e) => onTaskClick(e, task)}
      className="p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all group relative border border-black/5 hover:border-black/20 dark:border-white/10 dark:hover:border-white/30"
      style={{ backgroundColor: projectHex }}
    >
      
      {/* --- The Drag Handle (Hidden on Mobile) --- */}
      <div 
        {...dragHandleProps}
        onClick={(e) => e.stopPropagation()} 
        className={`hidden md:block absolute top-3 right-3 cursor-grab active:cursor-grabbing p-1 touch-none ${mutedTextColor} hover:${textColor} transition-colors`}
      >
        <GripHorizontal size={16} />
      </div>

      {/* --- Card Content Wrapper --- */}
      <div className="md:pr-8">
        
        {/* --- Project Name Kicker --- */}
        {task.project_name && (
          <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 ${mutedTextColor}`}>
            {task.project_name}
          </p>
        )}

        {/* --- Safe Labels Rendering --- */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {task.labels.map((label, index) => {
              const isObject = typeof label === 'object' && label !== null;
              const labelName = isObject ? label.name : label;
              let rawColor = isObject && label.color ? label.color : 'e2e8f0'; 
              
              const safeColorStr = String(rawColor);
              const bgColor = safeColorStr.startsWith('#') ? safeColorStr : `#${safeColorStr}`;
              
              // We use white/dark text for the labels too, independent of the card background
              const labelTextColor = getTextColorClass(bgColor) === 'text-white' ? '#ffffff' : '#0f172a';

              return (
                <span 
                  key={index} 
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: bgColor, color: labelTextColor }}
                >
                  {labelName}
                </span>
              );
            })}
          </div>
        )}

        {/* --- Task Content (Title) --- */}
        <h4 className={`font-bold text-sm leading-snug mb-2 ${textColor}`}>
          {task.content}
        </h4>
      </div>

      {/* --- Footer Indicators --- */}
      <div className="flex items-center justify-between mt-3">
        
        <div className={`flex items-center gap-2 ${mutedTextColor}`}>
            {task.description && (
                <AlignLeft size={14} className="opacity-90" />
            )}
            
            {task.github_issue_number && (
                <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${textColor === 'text-white' ? 'bg-white/20 text-white' : 'bg-black/10 text-slate-900'}`}>
                    <Github size={10} />
                    #{task.github_issue_number}
                </div>
            )}
        </div>
        
        {/* Priority Dot */}
        {task.priority && (
            <div 
              className={`w-2 h-2 rounded-full shadow-sm ring-1 ring-black/10 ${
                  task.priority === 'high' ? 'bg-red-500' :
                  task.priority === 'medium' ? 'bg-amber-500' :
                  'bg-emerald-500'
              }`} 
              title={`Priority: ${task.priority}`}
            />
        )}
      </div>
    </div>
  );
};