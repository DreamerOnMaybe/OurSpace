import { useState } from "react";

function NoteDetailModal({ date, text, onClose, onSave }) {
  const [editedText, setEditedText] = useState(text);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>📅 {date}</h3>
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          placeholder="Напишите заметку..."
        />
        <div className="add-modal-btns">
          <button className="close" onClick={onClose}>
            Отмена
          </button>
          <button
            onClick={() => {
              onSave(date, editedText);
              onClose();
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
} 

export default NoteDetailModal;
