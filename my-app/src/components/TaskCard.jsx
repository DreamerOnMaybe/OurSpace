import React from "react"
import './TaskCard.css'


function TaskCard({ task, onToggle }) {
    return (
        <div className={`task-card ${task.completed ? 'completed' : ''}`} onClick={() => onToggle(task.id)}>
            <span>{task.text}</span>
            <div className="custom-checkbox"></div>
        </div>
    )
}

export default TaskCard