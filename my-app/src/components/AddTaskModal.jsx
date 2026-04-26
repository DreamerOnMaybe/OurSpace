import React, { useState } from "react";

function AddTaskModal({ onAdd, onClose }) {
  const [tasks, setTasks] = useState([""]);
  const [taskTime, setTaskTime] = useState("")

  // обновление конкретного инпута по индексу
  const handleChange = (index, value) => {
    const updated = [...tasks];
    updated[index] = value;
    setTasks(updated);
  };

  // добавление нового пустого инпута
  const handleAddInput = () => {
    setTasks([...tasks, ""]);
  };

  // добавление всех задач и закрытие
  const handleAdd = () => {
    const filled = tasks.filter((t) => t.trim() !== "");
    if (filled.length === 0) return;
    const newTasks = filled.map(text => ({
      id: Date.now() + Math.random(),
      text: text,
      time: taskTime || null,
      completed: false
    }))
    onAdd(newTasks)
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Добавить задачу:</h3>

        {tasks.map((task, index) => (
          <input
            key={index}
            type="text"
            placeholder="Напишите задачу..."
            value={task}
            onChange={(e) => handleChange(index, e.target.value)}
          />
        ))}

        <div className="time-selection">
          <label>🔔 Напомнить в: </label>
          <input 
            type="time" 
            value={taskTime} 
            onChange={(e) => setTaskTime(e.target.value)} 
            className="modern-time-input"
          />
        </div>

        <button className="add-more" onClick={handleAddInput}>+ Добавить ещё</button>

        <div className="add-modal-btns">
          <button className="close" onClick={onClose}>
            Отмена
          </button>
          <button onClick={handleAdd}>Добавить</button>
        </div>
      </div>
    </div>
  );
}

export default AddTaskModal;
