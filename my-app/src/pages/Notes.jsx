import backBtn from '../assets/arrow-left-long.svg'
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react'
import { db, auth } from '../firebase.js'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import Header from "../components/Header.jsx"
import NoteDetailModal from '../components/NoteDetailModal.jsx'
import './Notes.css'

import plusBtn from '../assets/plus.svg'

function Notes() {
  const [notes, setNotes] = useState({})
  const [userId, setUserId] = useState(null)

  // состояние для модалки
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentNote, setCurrentNote] = useState({ date: '', text: '' })

  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUserId(currentUser.uid)
    })
  return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId) return
    const loadNotes = async () => {
      const docSnap = await getDoc(doc(db, 'users', userId))
      if (docSnap.exists()) {
        setNotes(docSnap.data().notes || {})
      }
    }
    loadNotes()
  }, [userId])

  const sortedNotes = Object.entries(notes)
    .filter(([, text]) => text.trim() !== '')
    .sort((a, b) => {
      const [dayA, monthA, yearA] = a[0].split('.')
      const [dayB, monthB, yearB] = b[0].split('.')
      return new Date(yearB, monthB - 1, dayB ) - new Date(yearA, monthA - 1, dayA)
    })

  const handleDeleteNote = async (date) => {
    const updatedNotes = { ...notes }
    delete updatedNotes[date]

    setNotes(updatedNotes)

    if (userId) {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        notes: updatedNotes
      })
    }
  }

  // функция для открытия модалки
  const handleAddNewNote = () => {
    const today = new Date().toLocaleDateString('ru-RU'); // Получаем ДД.ММ.ГГГГ
    setCurrentNote({ date: today, text: '' }); // Подставляем дату и пустой текст
    setIsModalOpen(true);
  };

  // функция сохранения/редактирования
  const handleSaveNote = async (date, newText) => {
    const updatedNotes = { ...notes, [date]: newText } // создаём копию и обновляем текст
    setNotes(updatedNotes) //Обновляем на экране

    if (userId) {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        notes: updatedNotes
      })
    }
  }

  return ( 
    <div className="app-container">
      <Header
        title={`Заметки`}
        leftIcon={backBtn}
        onLeftClick={() => navigate('/calendar')}
        rightIcon={plusBtn}
        onRightClick={handleAddNewNote}
      />

      <div className="notes-list">
        {sortedNotes.map(([date, text]) => (
          <div
            key={date}
            className='note-card'
            onClick={() => {
              setCurrentNote({ date, text })
              setIsModalOpen(true)
            }}
          >
            <div className="note-card-header">
              <span className="note-date">📅 {date}</span>
              <button className='delete' onClick={(e) => {
                e.stopPropagation() 
                handleDeleteNote(date)
              }}>🗑️</button>
            </div>
            <p className='note-preview'>{text}</p>
          </div>
        ))}
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
  )
}

export default Notes;
