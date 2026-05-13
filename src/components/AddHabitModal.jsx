import React, { useState } from "react"
import './AddHabitModal.css'

function AddHabitModal({onAdd, onClose}) {
    const [name, setName] = useState('')

    // Функция которая срабатывает при нажатии кнопки добавить
    const handleAdd = () => {
        if (!name.trim()) return

        //вызываем функцию из App.jsx и передаём новую привычку
        onAdd({
            id: Date.now(),
            name: name,
            icon: '⭐',
            minutes: 0,
            log: {}
        })

        onClose() // закрываем модальное окно
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* втроенный метод e.stopPropogation в React используется для предотвращения всплытия события */}
            <div className="modal" onClick={e => e.stopPropagation()}> 
                <h3>Добавить свою привычку:</h3>
                <input 
                    type="text" 
                    placeholder="Название привычки"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={25}
                />
                <div className="add-modal-btns">
                    <button className="close" onClick={onClose}>Отмена</button>
                    <button onClick={handleAdd}>Добавить</button>
                </div>
            </div>
        </div>
    )
}

export default AddHabitModal