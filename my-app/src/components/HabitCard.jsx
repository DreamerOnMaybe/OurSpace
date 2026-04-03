import React from "react"
import './HabitCard.css'

function HabitCard({ habit, onUpdateMinutes }) {
    return (
        <div className={`task-card ${habit.minutes > 0 ? 'completed' : ''}`}>
            <span>{habit.icon} {habit.name}</span>
            <div className="habit-card-right">
                <div className="minutes-counter">
                    <button onClick={(e) => { e.stopPropagation(); onUpdateMinutes(habit.id, -10) }}>-</button>
                    <span>{habit.minutes} мин.</span>
                    <button onClick={(e) => { e.stopPropagation(); onUpdateMinutes(habit.id, +10) }}>+</button>
                </div>
            </div>
        </div>
    )
}

export default HabitCard