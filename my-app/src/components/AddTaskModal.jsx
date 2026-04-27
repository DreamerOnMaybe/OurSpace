import React, { useState } from "react";

function AddTaskModal({ onAdd, onClose }) {
  const HOURS = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const MINUTES = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [isTimeEnabled, setIsTimeEnabled] = useState(false);

  const [tasks, setTasks] = useState([""]);

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

    // Склеиваем время только если пользователь включил опцию
    const finalTime = isTimeEnabled ? `${hour}:${minute}` : null;

    const newTasks = filled.map((text) => ({
      id: Date.now() + Math.random(),
      text: text,
      time: finalTime,
      completed: false,
    }));
    onAdd(newTasks);
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
          <div className="time-toggle-container">
            <span>🔔 Напомнить?</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isTimeEnabled}
                onChange={(e) => setIsTimeEnabled(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {isTimeEnabled && (
            <div className="custom-time-picker animated-fade-in">
              <select value={hour} onChange={(e) => setHour(e.target.value)}>
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span className="separator">:</span>
              <select
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
              >
                {MINUTES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button className="add-more" onClick={handleAddInput}>
          + Добавить ещё
        </button>

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
