import React from "react"
import TaskCard from "./TaskCard.jsx";

function TaskList({ tasks, onToggle, onDelete, onMove }) {
    return (
        <div className="task-list">
            {tasks.map(task => (
                <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onMove={onMove}/>
            ))}
        </div> 
        
    )
}

export default TaskList