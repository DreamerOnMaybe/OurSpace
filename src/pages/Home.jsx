import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
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
  const safeMaxGlasses = Math.max(1, maxGlasses);
  const progress = 282.7 - (282.7 * glasses) / safeMaxGlasses; // вычисляем strokeDashoffset для SVG круга
  // const progressSteps = 282.7 - (282.7 * currentSteps) / maxSteps;
  const [weather, setWeather] = useState(null); // данные погоды, null пока не загрузилась
  const [userCity, setUserCity] = useState("");
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const recommendation =
    weather?.main == null
      ? "Погода загружается..."
      : weather.main.temp >= 0
        ? "Хорошая погода для прогулки ⛅️"
        : "Сейчас прохладно ☁️";
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleAddHabit = async (newHabitData) => {
    try {
      const { id: _, ...habitData } = newHabitData;

      const docRef = await addDoc(collection(db, "users", userId, "habits"), {
        ...habitData,
        minutes: 0,
        log: {},
      });
      setHabits((prev) => [
        { id: docRef.id, ...habitData, minutes: 0, log: {} },
        ...prev,
      ]);

      setIsModalOpen(false);
    } catch (error) {
      console.error("Ошибка при добавлении привычки: ", error);
    }
  };

  const [displayCity, setDisplayCity] = useState("");

  const fetchWeather = async (city) => {
    // 1. Проверяем кэш
    const CACHE_KEY = `weather_cache_${city}`;
    const cached = localStorage.getItem(CACHE_KEY);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;

      // Если кэш свежий (меньше 30 минут) — используем его
      if (now - timestamp < thirtyMinutes) {
        console.log("Погода загружена из кэша");
        setWeather(data);
        setDisplayCity(data.name);
        setIsLoadingWeather(false);
        return;
      }
    }

    // 2. Если кэша нет или он старый — делаем запрос
    setIsLoadingWeather(true);

    try {
      const apiKey = import.meta.env.VITE_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ru`;
      const res = await fetch(url);

      if (!res.ok) throw new Error("Город не найден или API недоступен");

      const rawData = await res.json();

      // 3. Форматируем под наш UI
      const formattedWeather = {
        main: {
          temp: rawData.main.temp,
          humidity: rawData.main.humidity,
        },
        wind: {
          speed: rawData.wind.speed,
        },
        name: rawData.name,
      };

      // 4. Сохраняем в кэш
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: formattedWeather,
          timestamp: Date.now(),
        })
      );

      setWeather(formattedWeather);
      setDisplayCity(rawData.name);
      setIsLoadingWeather(false);
    } catch (err) {
      console.error("Ошибка погоды:", err);

      // Если запрос не удался, но есть кэш — показываем его (даже старый)
      if (cached) {
        console.log("API недоступен, показываем кэш");
        const { data } = JSON.parse(cached);
        setWeather(data);
        setDisplayCity(data.name);
      } else {
        setDisplayCity(city);
        setWeather(null);
      }

      setIsLoadingWeather(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      fetchWeather("Omsk");
    }
  }, []);

  useEffect(() => {
    if (userCity) {
      fetchWeather(userCity);
    }
  }, [userCity]);

  useEffect(() => {
    if (!userId) return;

    const loadUserData = async () => {
      const CACHE_KEY = `app_cache_${userId}`

      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setHabits(parsed.habits || [])
          setGlasses(parsed.glasses || 0)
          setMaxGlasses(parsed.maxGlasses || 10)
          setMaxSteps(parsed.maxSteps || 10000)
          setUserCity(parsed.city || 'Omsk')
          setDataLoaded(true)
        } catch (err) {
          console.log('ошибка парсинга кэша: ', err)
        }
      }

      try {
        const today = new Date().toISOString().split("T")[0];
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        const habitsSnapshot = await getDocs(
          collection(db, "users", userId, "habits"),
        );

        let habitsList = habitsSnapshot.docs.map((habitDoc) => {
          const data = habitDoc.data();
          const { id: _, ...restOfData } = data;
          return {
            id: habitDoc.id,
            ...restOfData,
          };
        });

        let finalHabits = habitsList

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();

          if (
            habitsList.length === 0 &&
            data.habits &&
            data.habits.length > 0
          ) {
            for (const habit of data.habits) {
              const { id: _, ...habitData } = habit;
              const docRef = await addDoc(
                collection(db, "users", userId, "habits"),
                habitData,
              );
              habitsList.push({ id: docRef.id, ...habitData });
            }
            await setDoc(userDocRef, { habits: [] }, { merge: true });
          } else if (habitsList.length === 0) {
            for (const habit of defaultHabits) {
              const { id: _, ...habitData } = habit;
              await addDoc(
                collection(db, "users", userId, "habits"),
                habitData,
              );
            }
            const newSnapshot = await getDocs(
              collection(db, "users", userId, "habits"),
            );
            habitsList = newSnapshot.docs.map((habitDoc) => {
              const data = habitDoc.data();
              const { id: _, ...restOfData } = data;
              return { id: habitDoc.id, ...restOfData };
            });
          }

          finalHabits = habitsList

          // 1. Город
          const cityFromDb = data.city || "Moscow";
          setUserCity(cityFromDb); // триггерует погоду

          // 2. Дата и сброс привычек
          const savedDate = data.date;
          const now = new Date();
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          if (savedDate !== today) {
            let currentStreak = data.streak || 0;

            const wasYesterdayProductive = habitsList.some(
              (h) =>
                h.log && h.log[yesterdayStr] && h.log[yesterdayStr].minutes > 0,
            );

            if (savedDate !== yesterdayStr || !wasYesterdayProductive) {
              currentStreak = 0;
            }

            const resetHabits = habitsList.map((h) => ({
              ...h,
              minutes: 0,
              completed: false,
            }));

            finalHabits = resetHabits
            setHabits(resetHabits);
            setGlasses(0);

            for (const habit of resetHabits) {
              const habitRef = doc(db, 'users', userId, 'habits', habit.id)
              await updateDoc(habitRef, {
                minutes: 0,
                completed: false
              })
            }

            // Обновляем стрик и дату
            await setDoc(
              userDocRef,
              { streak: currentStreak, date: today },
              { merge: true },
            );
          } else {
            setHabits(habitsList);
            setGlasses(data.glasses || 0);
          }

          // 3. Настройки
          setMaxGlasses(data.maxGlasses || 10);
          setMaxSteps(data.maxSteps || 10000);
          setUserCity(data.city || "Omsk");
        } else {
          // Если пользователя нет — создать профиль по умолчанию
          await setDoc(userDocRef, {
            glasses: 0,
            streak: 0,
            date: today,
            maxGlasses: 10,
            maxSteps: 10000,
            city: "Omsk",
          });

          for (const habit of defaultHabits) {
            const { id: _, ...habitData } = habit;
            await addDoc(collection(db, "users", userId, "habits"), habitData);
          }

          const newSnapshot = await getDocs(
            collection(db, "users", userId, "habits"),
          );
          habitsList = newSnapshot.docs.map((habitDoc) => {
            const data = habitDoc.data();
            const { id: _, ...restOfData } = data;
            return { id: habitDoc.id, ...restOfData };
          });

          finalHabits = habitsList
          setUserCity("Omsk");
          setHabits(habitsList);
          setGlasses(0);
        }

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            habits: finalHabits,
            glasses: userDocSnap.exists() ? userDocSnap.data().glasses || 0 : 0,
            maxGlasses: userDocSnap.exists() ? userDocSnap.data().maxGlasses || 10 : 10,
            maxSteps: userDocSnap.exists() ? userDocSnap.data().maxSteps || 10000 : 10000,
            city: userDocSnap.exists() ? userDocSnap.data().city || "Omsk" : "Omsk",
            date: today,
          })
        )

        setDataLoaded(true);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        setDataLoaded(true);
      }
    };

    loadUserData();
  }, [userId]);

  useEffect(() => {
    if (!userId || !dataLoaded) return;

    const CACHE_KEY = `app_cache_${userId}`

    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}")
    cached.glasses = glasses;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));

    const saveData = async () => {
      const today = new Date().toISOString().split("T")[0];
      await setDoc(
        doc(db, "users", userId),
        {
          glasses,
          date: today,
          maxGlasses,
          maxSteps,
        },
        { merge: true },
      );
    };
    saveData();
  }, [glasses, userId, dataLoaded, maxGlasses, maxSteps]);

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

  const handleDeleteHabit = async (id) => {
    try {
      const habitRef = doc(db, "users", userId, "habits", String(id));
      await deleteDoc(habitRef);
      const updatedHabits = habits.filter((habit) => habit.id !== id);
      setHabits(updatedHabits);
    } catch (error) {
      console.error("Ошибка при удалении: ", error);
      return;
    }
  };

  const handleUpdateMinutes = async (id, amount) => {
    if (!userId) return;
    const today = new Date().toISOString().split("T")[0];

    const currentHabit = habits.find((h) => h.id === id);
    if (!currentHabit) return;

    const newMinutes = Math.max(0, currentHabit.minutes + amount);

    const newLog = {
      ...currentHabit.log,
      [today]: {
        minutes: newMinutes,
        completed: newMinutes > 0,
      },
    };

    try {
      const habitRef = doc(db, "users", userId, "habits", String(id));
      await updateDoc(habitRef, {
        minutes: newMinutes,
        log: newLog,
      });
    } catch (error) {
      console.error("Ошибка при обновлении привычки:", error);
    }

    const updateHabits = habits.map((habit) => {
      if (habit.id !== id) return habit;
      return {
        ...habit,
        minutes: newMinutes,
        log: newLog,
      };
    });

    // Проверяем ДО обновления
    const isFirstActivityToday =
      habits.every((h) => !h.completed && h.minutes === 0) && glasses === 0;

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
          <span className="city-name">📍 {displayCity}</span>
        </div>
        {isLoadingWeather ? (
          <p>Загружаем погоду...</p>
        ) : weather === null ? (
          <p>Не удалось загрузить погоду</p>
        ) : (
          <div className="weather-statistic">
            <div className="weather-card-item">
              <p className="temp card-text">{Math.round(weather.main.temp)}°</p>
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
            <p className="weather-recommendation">{recommendation}</p>
          </div>
        )}
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
