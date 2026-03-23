import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import "../App.css";
import './Calendar.css'
import AddTaskModal  from "../components/AddTaskModal";
import TaskList from "../components/TaskList";

import backBtn from "../assets/arrow-left-long.svg";
import calendar from "../assets/calendar.svg";
import home from "../assets/home.svg";
import user from "../assets/user.svg";
import plus from "../assets/plus.svg";
import bellNotification from "../assets/bell-notification.svg";

function Calendar() {
  const navigate = useNavigate()

  const [selectedDay, setSelectedDay] = useState(new Date())
  //Получаем текущую неделю  getWeekDay стрелочная функция в которой мы получаем сегодняшний день в today и массив дней недели days
  const getWeekDays = () => {
    const today = new Date()
    const days = []

    //Находим понедельник текущей недели в monday в dayOfWeek мы получаем сегодняшний день
    const monday = new Date(today)
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // today.getDay() возвращает число от 0 до 6, где 0 это воскресенье, 1 понедельник, 2 вторник и так далее. Например сегодня среда — getDay() вернёт 3. Чтобы найти понедельник нужно отнять 2 дня назад. Формула 1 - dayOfWeek как раз это и считает: 1 - 3 = -2.
    monday.setDate(today.getDate() + diff) // Если воскресенье — getDay() вернёт 0, и формула даст 1 - 0 = 1 что неправильно, поэтому для воскресенья особый случай -6.
    // monday.setDate(today.getDate() + diff) — просто берём сегодняшнее число и прибавляем diff. Если сегодня 19 и diff = -2, получаем 17 — это и есть понедельник.

    //Генерируем 7 дней начиная с понедельника
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      days.push(day)
    }
    // i начинается с 0 и увеличивается до 6 — семь раз. Каждый раз создаём новый день от понедельника + i дней, и пушим в массив. Получаем 7 дней от понедельника до воскресенья.
    return days
  }
  const weekDays = getWeekDays()
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  const [activeTab, setActiveTab] = useState('tasks') // объявление переменной состояния и функции для её обновления

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks')
    return savedTasks ? JSON.parse(savedTasks) : {}
  }) // вместо начального значения передаём функцию. она выполняется один раз при загрузке - достаёт задачи из localStorage. если там что-то есть - парсим из строки в объект, иначе возвращаем пустой объект

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleAddTasks = (newTask) => {
    const dataKey = formatDate(selectedDay) // получаем ключ выбранного дня
    const dayTasks = tasks[dataKey] || [] // берем задачи этого дня, если их нет - пустой массив
    setTasks({
      ...tasks, // копируем все остальные дни без изменений
      [dataKey]: [newTask, ...dayTasks] // для выбранного дня - добавляем новую задачу в начало
    });
  };

  const handleToggleTask = (id) => {
    const dateKey = formatDate(selectedDay) // ключ выбранного дня
    const dayTasks = tasks[dateKey] || [] // задачи этого дня
    setTasks({
      ...tasks, // остальные дни не трогаем
      [dateKey]: dayTasks.map(task => 
        task.id === id
          ? { ...task, completed: !task.completed } // нашли нужную задачу - переключаем completed
          : task // остальные задачи не трогаем
      )
    })
  }

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0') // число месяца, padStart добавляет 0 если число однозначное
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // месяц +1 потому что getMonth() считает с 0
    const year = date.getFullYear() // год
    return `${day}.${month}.${year}` // собираем строку 
  }

  const dateKey = formatDate(selectedDay) // ключ выбранного дня
  const currentDayTasks = tasks[dateKey] || [] // задачи выбранного дня, или пустой массив

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks)) // при каждом изменении tasks сохраняем в localStorage
  }, [tasks]) // следим за tasks

  const today = new Date()
  const todayFormatted = formatDate(today)

  return (
    <div className="app-container">
      <header className="header">
        <button className="grey-btn" onClick={() => navigate('/')}>
          <img src={backBtn} alt="Назад" />
        </button>
        <h2>Сегодня, {todayFormatted.slice(0, 5)}</h2>
        <div className="grey-btn">
          <img src={calendar} alt="Профиль" />
        </div>
      </header>

      <div className="week-strip">
        {weekDays.map((day, index) => (
          <button
            key={index}
            className={`day-btn ${selectedDay.toDateString() === day.toDateString() ? 'active' : ''}`}
            onClick={() => setSelectedDay(day)}
          >
            <span>{dayNames[index]}</span>
            <span>{day.getDate()}</span>
          </button>
        ))}
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'tasks' ? 'active' : ''} // тут проверка если activeTab равен значению tasks то добавляется класс active, если нет - то класса нет. то же самое и со второй кнопкой
          onClick={() => setActiveTab('tasks')} // а тут при клике на кнопку перерисовывается компонент с новым значением
        >
          Задачи
        </button>
        <button
          className={activeTab === 'notes' ? 'active' : ''}
          onClick={() => setActiveTab('notes')}
        >
          Заметки
        </button>
      </div>
      {activeTab === 'tasks' ? ( // если активная вкладка tasks то показываем список задач, иначе - список заметок, пока их нету, пустая страница
        currentDayTasks.length === 0
          ? <p className='empty-text'>Задач на сегодня пока нет...</p>
          : <TaskList tasks={currentDayTasks} onToggle={handleAddTasks} />
      ) : (
        <p className='empty-text'>Заметок пока нет...</p>
      )}

      <nav className="nav-bar">
        <button className="nav-item" onClick={() => navigate('/')}>
          <img src={home} alt="Кнопка домой" />
        </button>
        <button className="nav-item">
          <img src={user} alt="Кнопка в профиль" />
        </button>
        <button className="nav-item plus" onClick={() => setIsModalOpen(true)}>
          <img src={plus} alt="Кнопка добавить"/>
        </button>
        <button className="nav-item active">
          <img src={calendar} alt="Кнопка календарь" />
        </button>
        <button className="nav-item">
          <img src={bellNotification} alt="Кнопка уведомлений" />
        </button>
      </nav>
      {isModalOpen && (
        <AddTaskModal
          onAdd={handleAddTasks}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Calendar;
