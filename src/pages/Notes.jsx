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
  const [dataLoaded, setDataLoaded] = useState(false);

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

    const CACHE_KEY = `notes_cache_${userId}`;

    const loadNotes = async () => {
      // 1. МГНОВЕННАЯ ЗАГРУЗКА ИЗ КЭША
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setNotes(parsed.notes || {});
          setDataLoaded(true); // ← показываем UI сразу
        } catch (err) {
          console.error("Ошибка парсинга кэша:", err);
        }
      }

      // 2. ЗАПРОС К FIRESTORE В ФОНЕ
      try {
        const docSnap = await getDoc(doc(db, "users", userId));
        if (docSnap.exists()) {
          const freshNotes = docSnap.data().notes || {};
          setNotes(freshNotes);

          // 3. ОБНОВЛЯЕМ КЭШ СВЕЖИМИ ДАННЫМИ
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ notes: freshNotes })
          );
        }
        setDataLoaded(true);
      } catch (err) {
        console.error("Ошибка загрузки из Firestore:", err);
        setDataLoaded(true);
      }
    };

    loadNotes();
  }, [userId]);

  const sortedNotes = Object.entries(notes)
    .filter(([, text]) => typeof text === "string" && text.trim() !== "")
    .sort((a, b) => {
      const fullDateA = a[0].split("_")[0];
      const fullDateB = b[0].split("_")[0];

      const [dayA, monthA, yearA] = fullDateA.split(".");
      const [dayB, monthB, yearB] = fullDateB.split(".");

      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);

      if (dateB - dateA !== 0) return dateB - dateA;

      return b[0].split("_")[1] - a[0].split("_")[1];
    });

  const updateCache = (newNotes) => {
    if (!userId) return;
    const CACHE_KEY = `notes_cache_${userId}`;
    localStorage.setItem(CACHE_KEY, JSON.stringify({ notes: newNotes }));
  };

  const handleDeleteNote = async (date) => {
    const updatedNotes = { ...notes };
    delete updatedNotes[date];

    setNotes(updatedNotes);
    updateCache(updatedNotes); // ← обновляем кэш

    if (userId) {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { notes: updatedNotes });
    }
  };

  const handleAddNewNote = () => {
    const today = new Date().toLocaleDateString("ru-RU");
    setCurrentNote({ date: today, text: "" });
    setIsModalOpen(true);
  };

  const handleSaveNote = async (date, newText) => {
    const noteId = currentNote.id || `${date}_${Date.now()}`;

    const updatedNotes = { ...notes, [noteId]: newText };
    setNotes(updatedNotes);
    updateCache(updatedNotes); // ← обновляем кэш

    if (userId) {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { notes: updatedNotes }, { merge: true });
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
          const displayDate = id.split("_")[0];

          return (
            <div
              key={id}
              className="note-card"
              onClick={() => {
                setCurrentNote({ id, date: displayDate, text });
                setIsModalOpen(true);
              }}
            >
              <div className="note-card-header">
                <span className="note-date">📅 {displayDate}</span>
                <button
                  className="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(id);
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