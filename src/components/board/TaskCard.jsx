import React from 'react';
import { Github, GripVertical, AlignLeft, ExternalLink } from 'lucide-react';
import { getContrastText } from '@/lib/textColor';

export const TaskCard = ({ task, style, isOverlay, onClick }) => {
  const projectBgColor = task.project_color || '#94a3b8';
  const textColor = getContrastText(projectBgColor);
  
  const badgeBgStyle = textColor === 'white' ? 'bg-white/20 text-white' : 'bg-black/10 text-black'; 
  const iconColorClass = textColor === 'white' ? 'text-white/70' : 'text-black/50';
  const descriptionColorClass = textColor === 'white' ? 'text-white/80' : 'text-slate-700';

  const handleCardClick = (e) => {
    if (onClick) onClick(e, task);
  };

  return (
    <div 
      style={{ 
        ...style, 
        backgroundColor: projectBgColor,
        color: textColor 
      }}
      onClick={handleCardClick}
      className={`
        p-4 rounded-xl shadow-sm mb-3 border-2
        border-black/5 dark:border-white/5
        group relative overflow-hidden touch-none select-none
        transition-all duration-200
        ${isOverlay ? 'shadow-2xl scale-105 cursor-grabbing z-50 rotate-2' : 'hover:shadow-md cursor-pointer active:scale-[0.98]'}
      `}
    >
      <div className={`absolute top-4 right-3 ${iconColorClass} opacity-40 group-hover:opacity-100 transition-opacity`}>
        <GripVertical size={16} />
      </div>

      <div className="flex flex-col gap-2">
        {/* Top Row: Project Badge & ID */}
        <div className="flex justify-between items-start pr-6">
          <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${badgeBgStyle}`}>
            {task.project_name || 'No Project'}
          </span>
          
          {task.github_issue_number && (
            <div className={`flex items-center gap-1 text-xs font-bold ${iconColorClass}`}>
              <Github size={12} /> <span>#{task.github_issue_number}</span>
            </div>
          )}
        </div>

        {/* --- NEW: GitHub Labels Row --- */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {task.labels.map((label, idx) => {
              // GitHub sends hex without hash usually, handle both cases
              const bg = label.color.startsWith('#') ? label.color : `#${label.color}`;
              const labelText = getContrastText(bg);
              
              return (
                <span 
                  key={idx} 
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-black/5 shadow-sm leading-tight"
                  style={{ backgroundColor: bg, color: labelText }}
                  title={label.description || label.name}
                >
                  {label.name}
                </span>
              );
            })}
          </div>
        )}

        {/* Title */}
        <p className="font-bold text-[15px] leading-snug break-words mt-1">
          {task.content}
        </p>

        {/* Description Preview */}
        {task.description && (
          <p className={`text-xs leading-relaxed line-clamp-2 ${descriptionColorClass}`}>
            {task.description}
          </p>
        )}
        
        {/* Footer: Priority & Indicators */}
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-black/10 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase flex items-center gap-1.5 ${badgeBgStyle}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                task.priority === 'high' ? 'bg-red-500' : 
                task.priority === 'medium' ? 'bg-orange-400' : 'bg-blue-400'
              }`} />
              {task.priority || 'low'}
            </div>
            
            {/* Description Icon (if desc exists) */}
            {task.description && (
              <AlignLeft size={14} className={iconColorClass} />
            )}
          </div>

          {task.github_issue_number && (
            <ExternalLink size={12} className={`${iconColorClass} opacity-0 group-hover:opacity-100 transition-opacity`} />
          )}
        </div>
      </div>
    </div>
  );
};