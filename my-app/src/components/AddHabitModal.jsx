import React, { useState } from "react"
import './AddHabitModal.css'

function AddHabitModal({onAdd, onClose}) {
    // Локальный useState для выбранной привычки
    const [selectedHabit, setSelectedHabit] = useState(null)
    // Локальный useState для времени
    const [duration, setDuration] = useState('')

    // Список готовых привычек
    const defaultHabits = [
        { id: 1, name: 'Прогулка', icon: '🚶' },
        { id: 2, name: 'Пробежка', icon: '🏃' },
        { id: 3, name: 'Тренировка', icon: '💪' },
        { id: 4, name: 'Чтение', icon: '📖' },
        { id: 5, name: 'Медитация', icon: '🧘' },
    ]

    // Функция которая срабатывает при нажатии кнопки добавить
    const handleAdd = () => {
        if (!selectedHabit || !duration) return //если привычка не выбрана или время не указано - ничего не делаем

        //вызываем функцию из App.jsx и передаём новую привычку
        onAdd({
            id: Date.now() + Math.random(),
            name: selectedHabit.name,
            icon: selectedHabit.icon,
            duration: duration
        })

        onClose() // закрываем модальное окно
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* втроенный метод e.stopPropogation в React используется для предотвращения всплытия события */}
            <div className="modal" onClick={e => e.stopPropagation()}> 
                <h3>Добавить привычку:</h3>
                
                <div className="habit-options">
                    {defaultHabits.map(habit => (
                        <button
                            type="button"
                            key={habit.id}
                            className={`habit-option ${selectedHabit?.id === habit.id ? 'active' : ''}`}
                            onClick={() => setSelectedHabit(habit)}
                        >
                            {habit.icon} {habit.name}
                        </button>
                    ))}
                </div>

                <div className="modal-footer">
                    <input 
                        type="number"
                        placeholder="Время в минутах"
                        value={duration}
                        onChange={e => e.target.value.length <= 3 && setDuration(e.target.value)}
                        maxLength={3}
                    />

                    <div className="add-modal-btns">
                        <button onClick={handleAdd}>Добавить</button>
                        <button onClick={onClose}>Отмена</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddHabitModal