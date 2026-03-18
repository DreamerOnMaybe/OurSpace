import React from "react"
import './HabitCard.css'

function HabitCard({ habit }) {
    return (
        <div className="habit-card">
            <span>{habit.icon} {habit.name}</span>
            <span>{habit.duration} мин. ✅</span>
        </div>
    )
}

export default HabitCard