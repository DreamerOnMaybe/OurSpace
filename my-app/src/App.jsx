import React from 'react'
import './App.css'

import backIcon from './assets/arrow-left-long.svg'
import userAvatar from './assets/avatar.png'
import walk from './assets/walk.svg'
import water from './assets/water.svg'
import home from './assets/home.svg'
import user from './assets/user.svg'
import plus from './assets/plus.svg'
import calendar from './assets/calendar.svg'
import bellNotification from './assets/bell-notification.svg'

function App() {
  return (
    <div className='app-container'>
      <header className='header'>
        <button className='back-btn'>
          <img src={backIcon} alt="Назад" />
        </button>
        <h2>Сегодня</h2>
        <div className='avatar'>
          <img src={userAvatar} alt="Профиль" />
        </div>
      </header>

      <div className='stats-grid'>
        <div className='card green-card'>
          <div className="card-header">
            <span>Шаги</span>
            <img src={walk} alt="" />
          </div>
          <div className="steps-container">
            <svg width="100" height="100" viewBox="0 0 100 100">
              {/* Фоновый круг */}
              <circle 
                cx="50" cy="50" r="45" 
                stroke="rgba(255,255,255,0.2)" 
                strokeWidth="8" fill="none" 
              />
              {/* Круг прогресса */}
              <circle 
                cx="50" cy="50" r="45" 
                stroke="white" 
                strokeWidth="8" fill="none" 
                strokeDasharray="282.7" 
                strokeDashoffset="70" /* Это число меняет длину полоски */
                strokeLinecap="round"
                transform="rotate(-90 50 50)" /* Разворачиваем, чтобы начиналось сверху */
              />
            </svg>
            <div className="steps-count">
              <strong>6560</strong>
              <span>Шагов</span>
            </div>
          </div>
        </div>
        <div className="card coral-card">
          <div className="card-header">
            <span>Вода</span>
            <img src={water} alt="Вода" />
          </div>
          <div className="water-statistics">
            <p>2.48</p>
            <span>liters</span>
          </div>
        </div>
      </div>

      {/* Список полезных привычек, добавление/удаление */}

      <nav className="nav-bar">
        <button className='nav-item'>
          <img src={home} alt="Кнопка домой" />
        </button>
        <button className='nav-item'>
          <img src={user} alt="Кнопка в профиль" />
        </button>
        <button className='nav-item plus'>
          <img src={plus} alt="Кнопка добавить" />
        </button>
        <button className='nav-item'>
          <img src={calendar} alt="Кнопка календарь" />
        </button>
        <button className='nav-item'>
          <img src={bellNotification} alt="Кнопка уведомлений" />
        </button>
      </nav>
    </div>
  )
}

export default App
