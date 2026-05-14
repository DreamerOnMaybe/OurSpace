import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../App.css";
import HabitList from "../components/HabitList";
import AddHabitModal from "../components/AddHabitModal";
import Header from "../components/Header.jsx";
import Navbar from "../components/Navbar.jsx";
import SettingsModal from "../components/SettingsModal.jsx";

import walk from "../assets/walk.svg";
import water from "../assets/water.svg";
import sunny from "../assets/sunny.svg";
import wind from "../assets/wind.svg";
import humidity from "../assets/humidity.svg";
import moonIcon from "../assets/moon.svg";
import sunIcon from "../assets/sun.svg";

const apiKey = import.meta.env.VITE_API_KEY;

const defaultHabits = [
  { id: 1, name: "Прогулка", icon: "🚶", minutes: 0, log: {} },
  { id: 2, name: "Пробежка", icon: "🏃", minutes: 0, log: {} },
  { id: 3, name: "Тренировка", icon: "💪", minutes: 0, log: {} },
  { id: 4, name: "Чтение", icon: "📖", minutes: 0, log: {} },
  { id: 5, name: "Медитация", icon: "🧘", minutes: 0, log: {} },
];

function Home() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userId, setUserId] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const themeIcon = theme === "light" ? moonIcon : sunIcon;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUserId(currentUser ? currentUser.uid : null);
    });
    return () => unsubscribe();
  }, []);

  const [glasses, setGlasses] = useState(0); // количество выпитых стаканов, начальное значение 0
  const liters = (glasses * 0.2).toFixed(2); // переводим стаканы в литры, toFixed(2) - два знака после запятой
  const [maxGlasses, setMaxGlasses] = useState(10);
  const [maxSteps, setMaxSteps] = useState(10000);
  const progress = 282.7 - (282.7 * glasses) / maxGlasses; // вычисляем strokeDashoffset для SVG круга
  // const progressSteps = 282.7 - (282.7 * currentSteps) / maxSteps;
  const [weather, setWeather] = useState(null); // данные погоды, null пока не загрузилась
  const [userCity, setUserCity] = useState("");
  const recommendation =
    weather?.main == null
      ? "Погода загружается..."
      : weather.main.temp >= 0
        ? "Хорошая погода для прогулки ⛅️"
        : "Сейчас прохладно ☁️";
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleAddHabit = (newHabit) => {
    setHabits((prev) => [newHabit, ...prev]);
  };

  useEffect(() => {
    const fetchWeather = async (city) => {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${encodeURIComponent(apiKey)}&units=metric&lang=ru`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Город не найден");
        const data = await res.json();
        setWeather(data);
        setUserCity(data.name); // ← используем имя города из API, а не из БД (оно точнее!)
      } catch (err) {
        console.error("Ошибка погоды:", err);
        // Можно оставить старый город или показать дефолтный
        setUserCity(city);
        setWeather(null);
      }
    };

    if (userId && userCity) {
      fetchWeather(userCity);
    } else if (!userId) {
      fetchWeather("Omsk"); // гость
    }
  }, [userId, userCity]);

  useEffect(() => {
    if (!userId) return;

    const loadUserData = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();

          // 1. Город
          const cityFromDb = data.city || "Moscow";
          setUserCity(cityFromDb); // триггерует погоду

          // 2. Дата и сброс привычек
          const savedDate = data.date;
          const now = new Date();
          const today = now.toLocaleDateString();
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toLocaleDateString();

          if (savedDate !== today) {
            let currentStreak = data.streak || 0;

            const wasYesterdayProductive = (data.habits || []).some(
              (h) => h.completed || h.minutes > 0,
            );

            if (savedDate !== yesterdayStr || !wasYesterdayProductive) {
              currentStreak = 0;
            }

            const resetHabits = (data.habits || defaultHabits).map((h) => ({
              ...h,
              minutes: 0,
              completed: false,
            }));

            setHabits(resetHabits);
            setGlasses(0);

            // Обновляем стрик и дату
            await setDoc(
              userDocRef,
              { streak: currentStreak, date: today },
              { merge: true },
            );
          } else {
            setHabits(data.habits || defaultHabits);
            setGlasses(data.glasses || 0);
          }

          // 3. Настройки
          setMaxGlasses(data.maxGlasses || 10);
          setMaxSteps(data.maxSteps || 10000);
        } else {
          // Если пользователя нет — создать профиль по умолчанию
          await setDoc(userDocRef, {
            habits: defaultHabits,
            glasses: 0,
            streak: 0,
            date: new Date().toLocaleDateString(),
            maxGlasses: 10,
            maxSteps: 10000,
            city: "Omsk",
          });
          setUserCity("Omsk");
          setHabits(defaultHabits);
          setGlasses(0);
        }

        setDataLoaded(true);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        // Фолбэк
        setUserCity("Omsk");
        setHabits(defaultHabits);
        setGlasses(0);
        setDataLoaded(true);
      }
    };

    loadUserData();
  }, [userId]);
  useEffect(() => {
    if (!userId || !dataLoaded) return;

    const saveData = async () => {
      const today = new Date().toLocaleDateString();
      await setDoc(
        doc(db, "users", userId),
        {
          habits,
          glasses,
          date: today,
          maxGlasses,
          maxSteps,
        },
        { merge: true },
      );
    };
    saveData();
  }, [habits, glasses, userId, dataLoaded]);

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

  const handleDeleteHabit = (id) => {
    const updatedHabits = habits.filter((habit) => habit.id !== id);
    setHabits(updatedHabits);
  };

  const handleUpdateMinutes = async (id, amount) => {
    const today = new Date().toLocaleDateString();

    // Проверяем ДО обновления
    const isFirstActivityToday =
      habits.every((h) => !h.completed && h.minutes === 0) && glasses === 0;

    const updateHabits = habits.map((habit) => {
      if (habit.id !== id) return habit;
      const newMinutes = Math.max(0, habit.minutes + amount);
      return {
        ...habit,
        minutes: newMinutes,
        log: {
          ...habit.log,
          [today]: { minutes: newMinutes, completed: newMinutes > 0 },
        },
      };
    });

    setHabits(updateHabits);

    if (isFirstActivityToday && amount > 0 && userId) {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      const currentStreak = userSnap.data()?.streak || 0;

      await setDoc(userRef, { streak: currentStreak + 1 }, { merge: true });
    }
  };
  const handleSaveSettings = (newGlasses, newSteps) => {
    setMaxGlasses(newGlasses);
    setMaxSteps(newSteps);
  };

  useEffect(() => {
    if (!userId || !dataLoaded) return;

    const timer = setTimeout(async () => {
      const today = new Date().toLocaleDateString();
      await setDoc(
        doc(db, "users", userId),
        { habits, glasses, date: today, maxGlasses, maxSteps },
        { merge: true },
      );
    }, 1000); // Сохраняем не чаще раза в секунду

    return () => clearTimeout(timer);
  }, [habits, glasses, maxGlasses, maxSteps, userId, dataLoaded]);

  return (
    <div className="app-container">
      <Header
        title={"Сегодня"}
        onRightClick={toggleTheme}
        rightIcon={themeIcon}
        onLeftClick={() => setIsSettingsOpen(true)}
      />

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
              {/* <circle
                className="steps-progress"
                cx="50"
                cy="50"
                r="45"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeDasharray="282.7"
                strokeDashoffset={progressSteps}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              /> */}
            </svg>
            <div className="steps-count">
              <strong>0</strong>
              <span>Шагов</span>
              <span className="steps-goal">из {maxSteps}</span>
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
                <p>{glasses}</p>
                <span>Стаканов </span>
                <span>из {maxGlasses}</span>
              </div>
            </div>
            <div className="water-counter">
              <button onClick={() => glasses > 0 && setGlasses(glasses - 1)}>
                -
              </button>
              <span>{liters} л.</span>
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
        <div className="weather-header">
          <span className="city-name">📍 {userCity}</span>
        </div>
        <div className="weather-statistic">
          <div className="weather-card-item">
            <p className="temp card-text">
              {weather ? Math.round(weather.main.temp) : "--"}°
            </p>
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
        <p className="weather-recommendation">{recommendation}</p>
      </div>

      {habits.length === 0 ? (
        <p className="empty-text">Здесь пока пусто...</p>
      ) : (
        <HabitList
          habits={habits}
          onToggle={handleToggleHabit}
          onUpdateMinutes={handleUpdateMinutes}
          onDelete={handleDeleteHabit}
        />
      )}

      <Navbar
        activeTab="home"
        isChatCenter={false}
        onPlusClick={() => setIsModalOpen(true)}
      />
      {isModalOpen && (
        <AddHabitModal
          onAdd={handleAddHabit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {isSettingsOpen && (
        <SettingsModal
          maxGlasses={maxGlasses}
          maxSteps={maxSteps}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default Home;
