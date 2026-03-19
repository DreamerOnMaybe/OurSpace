import React from "react"

function TaskCard({ task }) {
    return (
        <div className="task-card">
            <input type="checkbox" checked={task.completed} readOnly/>
            <span>{task.text}</span>
        </div>
    )
}

export default TaskCard