import React, {useState} from 'react'
import './App.css'
import HabitList from './components/HabitList'
import AddHabitModal from './components/AddHabitModal'

import backIcon from './assets/arrow-left-long.svg'
import userAvatar from './assets/avatar.png'
import walk from './assets/walk.svg'
import water from './assets/water.svg'
import home from './assets/home.svg'
import user from './assets/user.svg'
import plus from './assets/plus.svg'
import calendar from './assets/calendar.svg'
import bellNotification from './assets/bell-notification.svg'
import sunny from './assets/sunny.svg'
import wind from './assets/wind.svg'
import humidity from './assets/humidity.svg'

function App() {
  const [glasses, setGlasses] = useState(0)
  const liters = (glasses * 0.2).toFixed(2)
  const [habits, setHabits] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const handleAddHabit = (newHabit) => {
    setHabits([...habits, newHabit])
  }

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
            <div className="water-amount">
              <p>{liters}</p>
              <span>Литров</span>
            </div>
            <div className="water-counter">
              <button onClick={() => glasses > 0 && setGlasses(glasses - 1)}>-</button>
              <span>{glasses} ст.</span>
              <button onClick={() => setGlasses(glasses + 1)}>+</button>
            </div>
          </div>
        </div>
      </div>

      <div className="weather-card">
        <div className="weather-statistic">
          <div className="weather-card-item">
            <p className='temp card-text'>28°</p>
            <img src={sunny} alt=""/>
          </div>
          <div className="weather-card-item">
            <p className='wind'>12 m/s</p>
            <img src={wind} alt=""/>
          </div>
          <div className="weather-card-item">
            <p className='humidity'>62 %</p>
            <img src={humidity} alt=""/>
          </div>
        </div>
        <p className="weather-recommendation">Хорошая погода для прогулки ⛅️</p>
      </div>

      {habits.length === 0 
        ? <p className='empty-text'>Здесь пока пусто...</p>
        : <HabitList habits={habits} />
      }

      <nav className="nav-bar">
        <button className='nav-item'>
          <img src={home} alt="Кнопка домой" />
        </button>
        <button className='nav-item'>
          <img src={user} alt="Кнопка в профиль" />
        </button>
        <button className='nav-item plus' onClick={() => setIsModalOpen(true)}>
          <img src={plus} alt="Кнопка добавить" />
        </button>
        <button className='nav-item'>
          <img src={calendar} alt="Кнопка календарь" />
        </button>
        <button className='nav-item'>
          <img src={bellNotification} alt="Кнопка уведомлений" />
        </button>
      </nav>
      {isModalOpen && (
        <AddHabitModal 
          onAdd={handleAddHabit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}

export default App
