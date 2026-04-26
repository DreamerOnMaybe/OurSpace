import React, { useState, useRef } from "react";
import "./TaskCard.css";
import TaskDetailModal from "./TaskDetaildModal";

function TaskCard({ task, onToggle, onDelete, onMove, onUpdateTime }) {
  const pressTimer = useRef(null)
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => {
      setIsDetailOpen(true)
    }, 500)
  }

  const handlePressEnd = () => {
    clearTimeout(pressTimer.current)
  }

  
  return (
    <>
      <div
        className={`task-card task-item ${task.completed ? "completed" : ""} ${isExpanded ? "expanded" : ""}`} 
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
      >
        <div className="task-top">
          <span className={isExpanded ? "" : "task-text"}>
            {task.text} {task.time && <span className="time-tag">({task.time})</span>}
            </span>
          <div className="task-right">
            {task.text.length > 20 && (
              <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded) }}>
                {isExpanded ? "▲" : "▼"}
              </button>
            )}
            <div className="custom-checkbox" onClick={(e) => { e.stopPropagation(); onToggle(task.id) }}></div>
          </div>
        </div>
      </div>
      {isDetailOpen && (
        <TaskDetailModal
          task={task}
          onClose={() => setIsDetailOpen(false)}
          onDelete={onDelete}
          onMove={onMove}
          onUpdateTime={onUpdateTime}
        />
      )}
    </>
  );
}
export default TaskCard;
