import React, { useState } from "react"
import './AddTaskModal.css'


function AddTaskModal ({onAdd, onClose}) {
    const [taskText, setTaskText] = useState('')
    const handleAdd = () => {
        if (!taskText) return

        onAdd({
            id: Date.now(),
            text: taskText,
            completed: false,
        })

        onClose()
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>Добавить задачу:</h3>

                <input 
                    type="text"
                    placeholder="Напишите задачу..."
                    value={taskText}
                    onChange={e => setTaskText(e.target.value)}
                />

                <div className="add-modal-btns">
                    <button onClick={handleAdd}>Добавить</button>
                    <button onClick={onClose}>Отмена</button>
                </div>
            </div>
        </div>
    )
}

export default AddTaskModal