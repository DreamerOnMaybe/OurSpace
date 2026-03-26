import React, { useState } from "react"

function AddNoteModal({onAdd, onClose}) {
    const [noteText, setNoteText] = useState('')
    const handleAdd = () => {
        if (!noteText) return

        onAdd(noteText)

        onClose()
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>Добавить Заметку:</h3>

                <label htmlFor="notes-text"></label>
                <textarea name="notes-text" id="note-input" value={noteText} onChange={e => setNoteText(e.target.value)}></textarea>

                <div className="add-modal-btns">
                    <button onClick={handleAdd}>Добавить</button>
                    <button onClick={onClose}>Отмена</button>
                </div>
            </div>
        </div>
    )
}

export default AddNoteModal