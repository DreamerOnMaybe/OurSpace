import { useState } from "react";

function TaskDetailModal({ task, onClose, onDelete, onMove, onUpdateTime }) {
  const HOURS = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const MINUTES = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  const initialTime = task.time ? task.time.split(":") : ["12", "00"];
  const [hour, setHour] = useState(initialTime[0]);
  const [minute, setMinute] = useState(initialTime[1]);

  const [moveDate, setMoveDate] = useState("");

  const handleSaveTime = () => {
    const finalTime = `${hour}:${minute}`;
    onUpdateTime(task.id, finalTime);
    onClose();
  };

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
          <div className="custom-time-picker">
            <select value={hour} onChange={(e) => setHour(e.target.value)}>
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            <span className="separator">:</span>

            <select value={minute} onChange={(e) => setMinute(e.target.value)}>
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="time-actions">
            <button onClick={handleSaveTime}>
              ✅ Сохранить время
            </button>
            <button
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
