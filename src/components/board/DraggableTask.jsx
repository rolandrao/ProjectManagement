import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';

export const DraggableTask = ({ task, index, onTaskClick }) => {
  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            marginBottom: '8px' // Spacing between cards
          }}
        >
          <TaskCard 
            task={task} 
            isOverlay={snapshot.isDragging}
            onClick={(e) => onTaskClick(e, task)} 
          />
        </div>
      )}
    </Draggable>
  );
};