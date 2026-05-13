import React from "react";
import TaskCard from "./TaskCard.jsx";
function TaskList({ tasks, onToggle, onDelete, onMove, onUpdateTime }) {
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onMove={onMove}
          onUpdateTime={onUpdateTime}
        />
      ))}
    </div>
  );
}

export default TaskList;
