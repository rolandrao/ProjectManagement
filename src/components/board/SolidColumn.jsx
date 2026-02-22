import React, { useState, useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard'; 

export const SolidColumn = ({ column, tasks, onTaskClick }) => {
  // --- React 18 Strict Mode Fix ---
  // Prevents the library from rendering Draggables before the DOM is fully ready
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 max-h-full">
      
      {/* --- Column Header --- */}
      <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          {column.title}
          <span className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </h3>
      </div>

      {/* --- Scrollable Task Area --- */}
      {isMounted && (
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                /* Flexbox Scroll Fixes */
                flex-1 overflow-y-auto min-h-0 
                
                /* Spacing & Mobile Padding */
                p-4 space-y-3 pb-32 md:pb-4 
                
                /* 🪄 The Zero-Scrollbar Class */
                no-scrollbar
                
                /* Dragging Visual Feedback */
                ${snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                transition-colors duration-200
              `}
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        // Prevent cards from looking squished while dragging
                        opacity: snapshot.isDragging ? 0.9 : 1,
                      }}
                    >
                      <TaskCard task={task} onTaskClick={onTaskClick} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
};