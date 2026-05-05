import React from "react";
import { useState } from "react";
import "./HabitCard.css";

function HabitCard({ habit, onUpdateMinutes, onDelete }) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <div className="task-card confirm-delete-mode">
        <span>Удалить "{habit.name}"?</span>
        <div className="confirm-btns">
          <button onClick={() => onDelete(habit.id)} className="confirm-yes">Да</button>
          <button onClick={() => setIsConfirming(false)} className="confirm-no">Нет</button>
        </div>
      </div>
    );
  }
  return (
    <div className={`task-card ${habit.minutes > 0 ? "completed" : ""}`}>
      <span>
        {habit.icon} {habit.name}
      </span>
      <div className="habit-card-right">
        <div className="minutes-counter">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateMinutes(habit.id, -10);
            }}
          >
            -
          </button>
          <span className="habit-name">{habit.minutes} мин.</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateMinutes(habit.id, +10);
            }}
          >
            +
          </button>
        </div>
      </div>
      <button className="delete-habit-btn" onClick={() => setIsConfirming(true)}>🗑️</button>
    </div>
  );
}

export default HabitCard;
