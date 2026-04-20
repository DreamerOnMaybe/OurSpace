import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { auth } from './firebase.js'
import { onAuthStateChanged } from 'firebase/auth' // слушатель который firebase вызывает каждый раз когда меняется состояние авторизации
import Home from './pages/Home.jsx'
import Calendar from './pages/Calendar.jsx'
import Auth from './pages/Auth.jsx'
import Profile from './pages/Profile.jsx'
import Notes from './pages/Notes.jsx'

import { Navigate } from 'react-router-dom'

function ProtectedRoute({ user, loading, children }) {
  if (loading) return null
  if (user === null) {
    return <Navigate to="/auth" />
  }
  return children
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe() // это очистка слушателя когда компонент размонтируется
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute user={user} loading={loading}>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute user={user} loading={loading}>
            <Calendar />
          </ProtectedRoute>
        } />
        <Route path="/auth" element={<Auth />} />
        <Route path='/profile' element={
          <ProtectedRoute user={user} loading={loading}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path='/notes' element={
          <ProtectedRoute user={user} loading={loading}>
            <Notes />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App