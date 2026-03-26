import React from "react"
import TaskCard from "./TaskCard.jsx";

function TaskList({ tasks, onToggle, onDelete }) {
    return (
        <div className="task-list">
            {tasks.map(task => (
                <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete}/>
            ))}
        </div>
    )
}

export default TaskList