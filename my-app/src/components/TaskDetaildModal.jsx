import { useState } from "react";

function TaskDetailModal({ task, onClose, onDelete, onMove, onUpdateTime }) {
  const [moveDate, setMoveDate] = useState("");
  const [taskTime, setTaskTime] = useState(task.time || "");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{task.text}</h3>

        <div className="task-move">
          <input
            type="text"
            placeholder="ДД.ММ.ГГГГ"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")}
            value={moveDate}
            onChange={(e) => setMoveDate(e.target.value)}
          />
          <button
            onClick={() => {
              if (moveDate) {
                onMove(task.id, moveDate);
                onClose();
              }
            }}
          >
            📅Перенести
          </button>
        </div>

        <div className="set-time">
          <h3>Напоминание</h3>
          <input
            type="time"
            value={taskTime}
            onChange={(e) => setTaskTime(e.target.value)}
          />
          <div className="time-actions">
            <button
              onClick={() => {
                onUpdateTime(task.id, taskTime);
                onClose();
              }}
            >
              ✅ Сохранить
            </button>

            {/* Кнопка для удаления времени */}
            <button
              className="clear-time"
              onClick={() => {
                onUpdateTime(task.id, null);
                onClose();
              }}
            >
              🚫 Без времени
            </button>
          </div>
        </div>

        <div className="bottom-btns">
          <button
            className="delete"
            onClick={() => {
              onDelete(task.id);
              onClose();
            }}
          >
            🗑️ Удалить
          </button>
          <button className="close" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
