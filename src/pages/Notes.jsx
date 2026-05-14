import backBtn from "../assets/arrow-left-long.svg";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db, auth } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import Header from "../components/Header.jsx";
import NoteDetailModal from "../components/NoteDetailModal.jsx";
import "./Notes.css";

import plusBtn from "../assets/plus.svg";

function Notes() {
  const [notes, setNotes] = useState({});
  const [userId, setUserId] = useState(null);

  // состояние для модалки
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState({ date: "", text: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUserId(currentUser ? currentUser.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const loadNotes = async () => {
      const docSnap = await getDoc(doc(db, "users", userId));
      if (docSnap.exists()) {
        setNotes(docSnap.data().notes || {});
      }
    };
    loadNotes();
  }, [userId]);

  const sortedNotes = Object.entries(notes)
    .filter(([, text]) => text.trim() !== "")
    .sort((a, b) => {
      const fullDateA = a[0].split("_")[0];
      const fullDateB = b[0].split("_")[0];

      const [dayA, monthA, yearA] = fullDateA.split(".");
      const [dayB, monthB, yearB] = fullDateB.split(".");

      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);

      if (dateB - dateA !== 0) return dateB - dateA;

      return b[0].split('_')[1] - a[0].split('_')[1];
    });

  const handleDeleteNote = async (date) => {
    const updatedNotes = { ...notes };
    delete updatedNotes[date];

    setNotes(updatedNotes);

    if (userId) {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { notes: updatedNotes }, { merge: true })
    }
  };

  // функция для открытия модалки
  const handleAddNewNote = () => {
    const today = new Date().toLocaleDateString("ru-RU"); // Получаем ДД.ММ.ГГГГ
    setCurrentNote({ date: today, text: "" }); // Подставляем дату и пустой текст
    setIsModalOpen(true);
  };

  // функция сохранения/редактирования
  const handleSaveNote = async (date, newText) => {
    const noteId = currentNote.id || `${date}_${Date.now()}`;

    const updatedNotes = { ...notes, [noteId]: newText }; // создаём копию и обновляем текст
    setNotes(updatedNotes); //Обновляем на экране

    if (userId) {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { notes: updatedNotes }, { merge: true })
    }
  };

  return (
    <div className="app-container">
      <Header
        title={`Заметки`}
        leftIcon={backBtn}
        onLeftClick={() => navigate("/calendar")}
        rightIcon={plusBtn}
        onRightClick={handleAddNewNote}
      />
      <div className="notes-list">
        {sortedNotes.map(([id, text]) => {
          // Разделяем строку по символу "_" и берем первую часть (дату)
          const displayDate = id.split("_")[0];

          return (
            <div
              key={id} // Используем полный ID как уникальный ключ для React
              className="note-card"
              onClick={() => {
                // Передаем и ID, и чистую дату в состояние модалки
                setCurrentNote({ id, date: displayDate, text });
                setIsModalOpen(true);
              }}
            >
              <div className="note-card-header">
                {/* Выводим чистую дату БЕЗ хвоста */}
                <span className="note-date">📅 {displayDate}</span>
                <button
                  className="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(id); // Удаляем по полному ID
                  }}
                >
                  🗑️
                </button>
              </div>
              <p className="note-preview">{text}</p>
            </div>
          );
        })}
      </div>
      {isModalOpen && (
        <NoteDetailModal
          date={currentNote.date}
          text={currentNote.text}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveNote}
        />
      )}
    </div>
  );
}

export default Notes;
