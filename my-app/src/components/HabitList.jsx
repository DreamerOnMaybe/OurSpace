import React from "react"
import HabitCard from "./HabitCard";
import './HabitCard.css'

function HabitList({ habits, onToggle, onUpdateMinutes, onDelete }) {
    return (
        <div className="habit-list">
            {habits.map(habit => (
                <HabitCard key={habit.id} habit={habit} onToggle={onToggle} onUpdateMinutes={onUpdateMinutes} onDelete={onDelete}/>
            ))}
        </div>
    )
}

export default HabitList