import React from "react"
import HabitCard from "./HabitCard";
import './HabitCard.css'

function HabitList({ habits }) {
    return (
        <div className="habit-list">
            {habits.map(habit => (
                <HabitCard key={habit.id} habit={habit} />
            ))}
        </div>
    )
}

export default HabitList