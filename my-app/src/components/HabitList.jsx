import React from "react"
import HabitCard from "./HabitCard";
import './HabitCard.css'

function HabitList({ habits, onToggle, onUpdateMinutes }) {
    return (
        <div className="habit-list">
            {habits.map(habit => (
                <HabitCard key={habit.id} habit={habit} onToggle={onToggle} onUpdateMinutes={onUpdateMinutes}/>
            ))}
        </div>
    )
}

export default HabitList