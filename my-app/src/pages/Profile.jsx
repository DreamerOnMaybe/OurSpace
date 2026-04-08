import React from "react";
import { useState, useEffect } from "react";
import { db } from '../firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase"; // Импорт конфига Firebase
import { signOut } from "firebase/auth"; // Импорт функции выхода
import "./Profile.css"
import Header from "../components/Header.jsx"
import Navbar from "../components/Navbar.jsx"

import defaultAvatar from "../assets/account.png"

function Profile() {
  const [isEditing, setIsEditing] = useState(false) // состояние редактирования текста профиля
  const [editData, setEditData] = useState({ name: '', bio: '' }) // состояние для изменений

  const [userId, setUserId] = useState(null) // состояние для id текущего пользователя
  const [userData, setUserData] = useState({ name: '', bio: '' }) // состояние для данных профиля - имя и био

  const handleSave = async () => { // функция сохранения
    await setDoc(doc(db, 'users', userId), {
      name: editData.name,
      bio: editData.bio
    }, { merge: true })
    setUserData(editData)
    setIsEditing(false)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => { // слушаем firebase auth - когда пользователь загрузился, сохраняем его uid- уникальный идентификатор пользователя
      if (currentUser) setUserId(currentUser.uid)
    })
    return () => unsubscribe() // отписываемся когда компонент удаляется
  }, [])

  useEffect(() => { // загружаем данные профиля из Firestore когда узнали userId, зависимость userId запускается только когда он изменился
    if (!userId) return // ждем пока не узнаем пользователя
    const loadProfile = async () => {
      const docSnap = await getDoc(doc(db, 'users', userId))
      if (docSnap.exists()) {
        const data = docSnap.data()
        setUserData({
          name: data.name || '', // если нет имени - пустая строка
          bio: data.bio || ''
        })
      }
    }
    loadProfile()
  }, [userId])

  const handleSignOut = async () => {
    await signOut(auth);
  };


  return (
    <div className="app-container">
      <Header
        title={auth.currentUser?.displayName || 'Профиль'}
        onRightClick={handleSignOut}
      />

      <div className="profile-card">
        <div className="profile-avatar">
          <img src={defaultAvatar} alt="" />
        </div>
        <div className="profile-info">
          {isEditing ? (
            <>
              <input
                value={editData.name}
                onChange={e => setEditData({...editData, name: e.target.value})}
                placeholder="Ваше имя"
              />
              <input  
                value={editData.bio}
                onChange={e => setEditData({...editData, bio: e.target.value})}
                placeholder="О себе"
              />
              <div className="set-editing-btns">
                <button className="close" onClick={() => setIsEditing(false)}>Отмена</button>
                <button onClick={handleSave}>Сохранить</button>
              </div>
            </>
          ): (
            <>
              <h2 className="profile-name">{userData.name || 'Без имени'}</h2>
              <p className="profile-desc">{userData.bio || 'Добавьте описание'}</p>
              <button className="editing-btn" onClick={() => { setEditData(userData); setIsEditing(true) }}>✏️</button>
            </>
          )}
        </div>
      </div>

      <Navbar activeTab='profile' isChatCenter={true} />
    </div>
  );
}

export default Profile;
