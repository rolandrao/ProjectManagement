import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { DraggableTask } from './DraggableTask';

export const SolidColumn = React.memo(({ column, tasks, onTaskClick }) => {
  return (
    <div className="w-80 flex-shrink-0 flex flex-col gap-3 h-full">
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
              p-2 rounded-xl flex-1 flex flex-col gap-2 min-h-[150px]
              bg-bg-column border border-border dark:bg-dark-bg-column dark:border-dark-border
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