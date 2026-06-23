import React from "react";
import { useState, useEffect } from "react";
import { db } from "../firebase.js";
import { doc, getDoc, setDoc, getDocs, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase"; // Импорт конфига Firebase
import { signOut } from "firebase/auth"; // Импорт функции выхода
import "./Profile.css";
import Header from "../components/Header.jsx";
import Navbar from "../components/Navbar.jsx";

import habitsIcon from "../assets/habits-stat.svg";
import tasksIcon from "../assets/tasks-stat.svg";
import streakIcon from "../assets/streak-stat.svg";
import logOut from "../assets/log-out.svg";

import AvatarModal from "../components/AvatarModal.jsx";

import defaultAvatar from "../assets/account.png";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleSelectAvatar = async (avatarSrc) => {
    setAvatar(avatarSrc);
    await setDoc(
      doc(db, "users", userId),
      { avatar: avatarSrc },
      { merge: true },
    );
  };

  const getWeekDays = () => {
    const today = new Date();
    const days = [];

    //Находим понедельник текущей недели в monday в dayOfWeek мы получаем сегодняшний день
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // today.getDay() возвращает число от 0 до 6, где 0 это воскресенье, 1 понедельник, 2 вторник и так далее. Например сегодня среда — getDay() вернёт 3. Чтобы найти понедельник нужно отнять 2 дня назад. Формула 1 - dayOfWeek как раз это и считает: 1 - 3 = -2.
    monday.setDate(today.getDate() + diff); // Если воскресенье — getDay() вернёт 0, и формула даст 1 - 0 = 1 что неправильно, поэтому для воскресенья особый случай -6.
    // monday.setDate(today.getDate() + diff) — просто берём сегодняшнее число и прибавляем diff. Если сегодня 19 и diff = -2, получаем 17 — это и есть понедельник.

    //Генерируем 7 дней начиная с понедельника
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    // i начинается с 0 и увеличивается до 6 — семь раз. Каждый раз создаём новый день от понедельника + i дней, и пушим в массив. Получаем 7 дней от понедельника до воскресенья.
    return days;
  };

  const formatDay = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const isDayCompleted = (date) => {
    const dateKey = formatDay(date);
    if (!habits || habits.length === 0) return false;

    return habits.some((habit) => {
      return (
        habit.log && habit.log[dateKey] && habit.log[dateKey].completed === true
      );
    }); // проверяем, есть ли в логах привычки, которые были выполнены в этот день
  };

  const [habits, setHabits] = useState([]);

  const [stats, setStats] = useState({
    habitsCompleted: 0,
    tasksCompleted: 0,
    streak: 0,
  });

  const [userId, setUserId] = useState(null); // состояние для id текущего пользователя
  const [userData, setUserData] = useState({ name: "", bio: "" }); // состояние для данных профиля - имя и био

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // слушаем firebase auth - когда пользователь загрузился, сохраняем его uid- уникальный идентификатор пользователя
      setUserId(currentUser ? currentUser.uid : null);
    });
    return () => unsubscribe(); // отписываемся когда компонент удаляется
  }, []);

  useEffect(() => {
    // загружаем данные профиля из Firestore когда узнали userId, зависимость userId запускается только когда он изменился
    if (!userId) return; // ждем пока не узнаем пользователя
    const loadProfile = async () => {
      try {
        const docSnap = await getDoc(doc(db, "users", userId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAvatar(data.avatar || defaultAvatar);
          setUserData({
            name: data.name || "", // если нет имени - пустая строка
            bio: data.bio || "",
          });
          const habitsSnapshot = await getDocs(
            collection(db, "users", userId, "habits"),
          );
          const habitsList = habitsSnapshot.docs.map((habitDoc) => {
            const data = habitDoc.data();
            const { id: _, ...restOfData } = data;
            return { id: habitDoc.id, ...restOfData };
          });

          const tasks = data.tasks || {}; // берем задачи, если нет - пустой объект

          const totalHabitsCompleted = habitsList.reduce((acc, habit) => {
            const completedCount = habit.log
              ? Object.values(habit.log).filter(
                  (logEntry) => logEntry.completed,
                ).length
              : 0;
            return acc + completedCount;
          }, 0);

          const tasksCompleted = Object.values(tasks)
            .flat()
            .filter((t) => t.completed).length;

          setStats({
            habitsCompleted: totalHabitsCompleted,
            tasksCompleted: tasksCompleted,
            streak: data.streak || 0,
          });

          setHabits(habitsList);
        }
      } catch (error) {
        console.error("Ошибка: ", error);
      }
    };
    loadProfile();
  }, [userId]);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="app-container">
      <Header
        title={"Профиль"}
        onRightClick={handleSignOut}
        rightIcon={logOut}
        onLeftClick={() => navigate("/settings")}
      />

      <div className="profile-card">
        <div
          className="profile-avatar"
          onClick={() => setIsAvatarModalOpen(true)}
        >
          <img src={avatar} alt="" />
          <div className="avatar-edit">📷</div>
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{userData.name || "Без имени"}</h2>
          <p className="profile-desc">{userData.bio || "Добавьте описание"}</p>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <img src={habitsIcon} alt="" />
          <strong>{stats.habitsCompleted}</strong>
          <p>Привычек выполнено</p>
        </div>
        <div className="stat-card">
          <img src={tasksIcon} alt="" />
          <strong>{stats.tasksCompleted}</strong>
          <p>Задач завершено</p>
        </div>
        <div className="stat-card">
          <img src={streakIcon} alt="" />
          <strong>{stats.streak}</strong>
          <p>Дней подряд</p>
        </div>
      </div>

      <div className="week-habits">
        <h3>Привычки на неделе</h3>
        <div className="week-circles">
          {getWeekDays().map((day, index) => (
            <div key={index} className="week-day">
              <div
                className={`habit-circle ${isDayCompleted(day) ? "completed" : ""}`}
              >
                {isDayCompleted(day) && <span>✓</span>}
              </div>
              <span>{["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][index]}</span>
            </div>
          ))}
        </div>
      </div>

      {isAvatarModalOpen && (
        <AvatarModal
          onSelect={handleSelectAvatar}
          onClose={() => setIsAvatarModalOpen(false)}
        />
      )}

      <Navbar activeTab="profile" isChatCenter={true} />
    </div>
  );
}

export default Profile;
