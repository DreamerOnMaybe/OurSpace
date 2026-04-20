import backBtn from '../assets/arrow-left-long.svg'
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react'
import { db, auth } from '../firebase.js'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import Header from "../components/Header.jsx"
import './Notes.css'

function Notes() {
  const [notes, setNotes] = useState({})
  const [userId, setUserId] = useState(null)

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

  return ( 
    <div className="app-container">
      <Header
        title={`Заметки`}
        leftIcon={backBtn}
        onLeftClick={() => navigate('/calendar')}
      />

      <div className="notes-list">
        {sortedNotes.length === 0
          ? <p className='empty-text'>Заметок пока нет...</p>
          : sortedNotes.map(([date, text]) => (
            <div key={date} className="note-card">
              <div className="note-card-header">
                <span className="note-date">📅 {date}</span>
                <button className='delete' onClick={() => handleDeleteNote(date)}>🗑️</button>
              </div>
              <p className="note-preview">{text}</p>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Notes;
