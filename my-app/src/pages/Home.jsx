import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
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

const defaultHabits = [
  { id: 1, name: 'Прогулка', icon: '🚶', minutes: 0, log: {} },
  { id: 2, name: 'Пробежка', icon: '🏃', minutes: 0, log: {} },
  { id: 3, name: 'Тренировка', icon: '💪', minutes: 0, log: {} },
  { id: 4, name: 'Чтение', icon: '📖', minutes: 0, log: {} },
  { id: 5, name: 'Медитация', icon: '🧘', minutes: 0, log: {} },
]

function Home() {
  const [userId, setUserId] = useState(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUserId(currentUser.uid)
    })
    return () => unsubscribe()
  }, [])

  const [glasses, setGlasses] = useState(0); // количество выпитых стаканов, начальное значение 0
  const liters = (glasses * 0.2).toFixed(2); // переводим стаканы в литры, toFixed(2) - два знака после запятой
  const maxGlasses = 10; // максимум 10 стаканов = 2 литра
  const progress = 282.7 - (282.7 * glasses) / maxGlasses; // вычисляем strokeDashoffset для SVG круга
  const [weather, setWeather] = useState(null); // данные погоды, null пока не загрузилась
  const recomendation =
    weather?.main.temp >= 0
      ? "Хорошая погода для прогулки ⛅️"
      : "Сейчас прохладно ☁️";
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleAddHabit = (newHabit) => {
    setHabits([newHabit, ...habits]);
  };
  const navigate = useNavigate();

  useEffect(() => {
    fetch(currentUrl) // делаем запрос к API
      .then((res) => res.json()) // преобразуем ответ в JSON
      .then((data) => setWeather(data)); // записываем данные в state
  }, []);
  useEffect(() => {
    if (!userId) return

    const loadData = async () => {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        const savedDate = data.date
        const today = new Date().toLocaleDateString()

        if (savedDate !== today) {
          // день сменился - сбрасываем только минуты и completed
          const resetHabits = (data.habits || defaultHabits).map(h => ({
            ...h,
            minutes: 0,
            completed: false
          }))
          setHabits(resetHabits)
          setGlasses(0)
        } else {
          // загружаем сохранённые данные
          setHabits(data.habits || defaultHabits)
          setGlasses(data.glasses || 0)
        }
      }
      setDataLoaded(true)
    }
    loadData()
  }, [userId]);
  useEffect(() => {
    if (!userId || !dataLoaded) return

    const saveData = async() => {
      const today = new Date().toLocaleDateString()
      await setDoc(doc(db, 'users', userId), {
        habits,
        glasses,
        date: today
      }, { merge: true })
    }
    saveData()
  }, [habits, glasses, userId, dataLoaded])

  const handleToggleHabit = (id) => {
    setHabits(
      habits.map(
        (habit) =>
          habit.id === id
            ? { ...habit, completed: !habit.completed } //Если id совпадает = меняем completed на противоположное
            : habit, // иначе оставляем привычку без изменений
      ),
    );
  };
  
  const handleUpdateMinutes = (id, amount) => {
    setHabits(
      habits.map(
        (habit) =>
          habit.id === id
          ? { ...habit, minutes: Math.max(0, habit.minutes + amount) }
          : habit
      )
    )
  }

  const handleSignOut = async () => {
    await signOut(auth)
  }

  return (
    <div className="app-container">
      <header className="header">
        <button className="grey-btn">
          <img src={settings} alt="Назад" />
        </button>
        <h2>Сегодня</h2>
        <button className="avatar" type="submit" onClick={handleSignOut}>
          <img src={userAvatar} alt="Профиль" />
        </button>
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
                // cx="50"
                // cy="50"
                // r="45"
                // stroke="white"
                // strokeWidth="8"
                // fill="none"
                // strokeDasharray="282.7"
                // strokeDashoffset="70" /* Это число меняет длину полоски */
                // strokeLinecap="round"
                // transform="rotate(-90 50 50)" /* Разворачиваем, чтобы начиналось сверху */
              />
            </svg>
            <div className="steps-count">
              <strong>0</strong>
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
            <div className="water-circle-container">
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
                  strokeDashoffset={
                    progress
                  } /* Это число меняет длину полоски */
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)" /* Разворачиваем, чтобы начиналось сверху */
                />
              </svg>
              <div className="water-amount">
                <p>{liters}</p>
                <span>Литров</span>
              </div>
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
        <HabitList habits={habits} onToggle={handleToggleHabit} onUpdateMinutes={handleUpdateMinutes}/>
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
        <button className="nav-item" onClick={() => navigate("/calendar")}>
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
