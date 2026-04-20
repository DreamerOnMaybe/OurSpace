import { useState } from "react";

function TaskDetailModal({ task, onClose, onDelete, onMove }) {
    const [moveDate, setMoveDate] = useState('')

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>{task.text}</h3>

                <div className="task-move">
                    <input 
                        type="date" 
                        value={moveDate}
                        onChange={e => setMoveDate(e.target.value)}
                    />
                    <button
                        onClick={() => {
                            if (moveDate) {
                                onMove(task.id, moveDate)
                                onClose()
                            }
                        }}
                    >
                        📅Перенести
                    </button>
                </div>
                
                <div className="bottom-btns">
                    <button className="delete" onClick={() => { onDelete(task.id); onClose() }}>🗑 Удалить</button>
                    <button className="close" onClick={onClose}>Закрыть</button>
                </div>
            </div>
        </div>
    )
}

export default TaskDetailModal