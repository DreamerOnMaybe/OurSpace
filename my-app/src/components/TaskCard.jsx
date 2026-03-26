import React, { useState } from "react";
import "./TaskCard.css";

import trash from "../assets/trash.svg";

function TaskCard({ task, onToggle, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div
      className={`task-card task-item ${task.completed ? "completed" : ""} ${isExpanded ? "expanded" : ""}`} onClick={() => onToggle(task.id)}>
      <div className="task-top">
        <span className={isExpanded ? "" : "task-text"}>{task.text}</span>
        <div className="task-right">
          {task.text.length > 20 && (
            <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded) }}>
              {isExpanded ? "▲" : "▼"}
            </button>
          )}
          <div className="custom-checkbox"></div>
          <button onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}>
            <img src={trash} alt="" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default TaskCard;
