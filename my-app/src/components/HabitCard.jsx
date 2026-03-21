import React from "react"
import './HabitCard.css'

function HabitCard({ habit, onToggle }) {
    return (
        <div className={`task-card ${habit.completed ? 'completed' : ''}`} onClick={() => onToggle(habit.id)}>
            <span>{habit.icon} {habit.name}</span>
            <div className="habit-card-right">
                <span>{habit.duration} мин.</span>
                <div className="custom-checkbox"></div>
            </div>
        </div>
    )
}

export default HabitCard