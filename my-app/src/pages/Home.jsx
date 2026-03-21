import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import "../App.css";
import HabitList from "../components/HabitList";
import AddHabitModal from "../components/AddHabitModal";

import settings from "../assets/settings.svg";
import userAvatar from "../assets/avatar.png";
import walk from "../assets/walk.svg";
import water from "../assets/water.svg";
import home from "../assets/home.svg";
import user from "../assets/user.svg";
import plus from "../assets/plus.svg";
import calendar from "../assets/calendar.svg";
import bellNotification from "../assets/bell-notification.svg";
import sunny from "../assets/sunny.svg";
import wind from "../assets/wind.svg";
import humidity from "../assets/humidity.svg";

const cityName = "Omsk";
const apiKey = import.meta.env.VITE_API_KEY;
const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric&lang=ru`;

function Home() {
  const [glasses, setGlasses] = useState(0);
  const liters = (glasses * 0.2).toFixed(2);
  const maxGlasses = 10;
  const progress = 282.7 - (282.7 * glasses) / maxGlasses;
  const [weather, setWeather] = useState(null);
  const recomendation =
    weather?.main.temp >= 0
      ? "Хорошая погода для прогулки ⛅️"
      : "Сейчас прохладно ☁️";
  const [habits, setHabits] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleAddHabit = (newHabit) => {
    setHabits([newHabit, ...habits]);
  };
  const navigate = useNavigate()

  useEffect(() => {
    fetch(currentUrl)
      .then((res) => res.json())
      .then((data) => setWeather(data));
  }, []);
  useEffect(() => {
    //Достаём сохранённые привычки и дату
    const savedHabits = localStorage.getItem("habits");
    const savedGlasses = localStorage.getItem("savedGlasses");
    const savedDate = localStorage.getItem("date");

    // Получаем сегодняшнюю дату
    const today = new Date().toLocaleDateString();

    if (savedDate !== today) {
      localStorage.setItem("date", today);
      localStorage.setItem("habits", JSON.stringify([]));
      setHabits([]);
      setGlasses(0);
      localStorage.setItem('savedGlasses', JSON.stringify(0))
    } else if (savedHabits && savedGlasses) {
      setHabits(JSON.parse(savedHabits));
      setGlasses(JSON.parse(savedGlasses));
    }
    setIsLoaded(true);
  }, []);
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem("savedGlasses", JSON.stringify(glasses));
  }, [habits, isLoaded, glasses]);

  const handleToggleHabit = (id) => {
    setHabits(habits.map(habit => 
      habit.id === id
        ? { ...habit, completed: !habit.completed } //Если id совпадает = меняем completed на противоположное
        : habit // иначе оставляем привычку без изменений
    ))
  }

  return (
    <div className="app-container">
      <header className="header">
        <button className="grey-btn">
          <img src={settings} alt="Назад" />
        </button>
        <h2>Сегодня</h2>
        <div className="avatar">
          <img src={userAvatar} alt="Профиль" />
        </div>
      </header>

      <div className="stats-grid">
        <div className="card green-card">
          <div className="card-header">
            <span>Шаги</span>
            <img src={walk} alt="" />
          </div>
          <div className="steps-container">
            <svg width="100" height="100" viewBox="0 0 100 100">
              {/* Фоновый круг */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="none"
              />
              {/* Круг прогресса */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="white"
                strokeWidth="8"
                fill="none"
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
            <svg width="100" height="100" viewBox="0 0 100 100">
              {/* Фоновый круг */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="none"
              />
              {/* Круг прогресса */}
              <circle
                className="water-progress"
                cx="50"
                cy="50"
                r="45"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeDasharray="282.7"
                strokeDashoffset={progress} /* Это число меняет длину полоски */
                strokeLinecap="round"
                transform="rotate(-90 50 50)" /* Разворачиваем, чтобы начиналось сверху */
              />
            </svg>
            <div className="water-amount">
              <p>{liters}</p>
              <span>Литров</span>
            </div>
            <div className="water-counter">
              <button onClick={() => glasses > 0 && setGlasses(glasses - 1)}>
                -
              </button>
              <span>{glasses} ст.</span>
              <button
                onClick={() => glasses < maxGlasses && setGlasses(glasses + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="weather-card">
        <div className="weather-statistic">
          <div className="weather-card-item">
            <p className="temp card-text">{Math.round(weather?.main.temp)}°</p>
            <img src={sunny} alt="" />
          </div>
          <div className="weather-card-item">
            <p className="wind">{weather?.wind.speed} m/s</p>
            <img src={wind} alt="" />
          </div>
          <div className="weather-card-item">
            <p className="humidity">{weather?.main.humidity} %</p>
            <img src={humidity} alt="" />
          </div>
        </div>
        <p className="weather-recommendation">{recomendation}</p>
      </div>

      {habits.length === 0 ? (
        <p className="empty-text">Здесь пока пусто...</p>
      ) : (
        <HabitList habits={habits} onToggle={handleToggleHabit}/>
      )}

      <nav className="nav-bar">
        <button className="nav-item active">
          <img src={home} alt="Кнопка домой" />
        </button>
        <button className="nav-item">
          <img src={user} alt="Кнопка в профиль" />
        </button>
        <button className="nav-item plus" onClick={() => setIsModalOpen(true)}>
          <img src={plus} alt="Кнопка добавить" />
        </button>
        <button className="nav-item" onClick={() => navigate('/calendar')}>
          <img src={calendar} alt="Кнопка календарь" />
        </button>
        <button className="nav-item">
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
  );
}

export default Home;
