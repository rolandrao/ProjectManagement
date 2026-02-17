import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { DraggableTask } from './DraggableTask';

export const SolidColumn = React.memo(({ column, tasks, onTaskClick }) => {
  return (
    // CHANGED: 'w-80' -> 'w-full'
    // The parent in KanbanBoard.jsx now controls the actual width (100% vs 320px)
    <div className="w-full flex-shrink-0 flex flex-col gap-3 h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm tracking-wide uppercase">
          {column.title}
        </h3>
        <span className="text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Drop Zone */}
      <Droppable droppableId={String(column.id)}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              p-2 rounded-xl flex-1 flex flex-col gap-3 min-h-[150px]
              bg-slate-100/50 border border-slate-200 
              dark:bg-slate-900/50 dark:border-slate-800
              transition-colors duration-200
              ${snapshot.isDraggingOver ? 'bg-slate-200 dark:bg-slate-800/80 ring-2 ring-blue-500/20' : ''}
            `}
          >
            {tasks.map((task, index) => (
               <DraggableTask 
                 key={task.id} 
                 task={task} 
                 index={index} 
                 onTaskClick={onTaskClick} 
               />
            ))}
            {/* The placeholder maintains size during drag */}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
});