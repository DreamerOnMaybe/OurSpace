import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import "../App.css";
import './Calendar.css'
import AddTaskModal  from "../components/AddTaskModal";
import TaskList from "../components/TaskList";

import { db, auth } from '../firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

import Header from "../components/Header.jsx"
import Navbar from "../components/Navbar.jsx"

import calendar from "../assets/calendar.svg";
import notesIcon from '../assets/notes.svg'


function Calendar() {
  const navigate = useNavigate();
  const handleMoveTask = (taskId, newDate) => {
    const [year, month, day] = newDate.split('-')
    const targetKey = `${day}.${month}.${year}`

    const currentKey = formatDate(selectedDay)
    const task = tasks[currentKey]?.find(t => t.id === taskId)

    if (!task) return

    const targetTasks = tasks[targetKey] || []
    setTasks({ 
      ...tasks,
      [targetKey]: [{ ...task, id: Date.now() }, ...targetTasks]
    })
  }

  const [userId, setUserId] = useState(null)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUserId(currentUser ? currentUser.uid : null);
    })
    return () => unsubscribe()
  }, [])

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

  const getMonthDays = (date) => {
    const year = date.getFullYear() // получаем текущий год
    const month = date.getMonth() // получаем текущий месяц

    const firstDay = new Date(year, month, 1) // получаем первый день месяца
    const lastDay = new Date(year, month + 1, 0) // получаем последний день месяца

    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() -1 // getDay возвращает день недели где 0=воскресенье, 1=понедельник, 6=суббота

    const days = [] // создаём массив дней месяца

    for (let i = 0; i < startOffset; i++) {
      days.push(null) // ставим пустые ячейки если месяц начинается не с понедельника
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d)) // заполняем ячейки днями
    }

    return days
  }

  const weekDays = getWeekDays()
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  const [activeTab, setActiveTab] = useState('tasks') // объявление переменной состояния и функции для её обновления

  const [tasks, setTasks] = useState({}) // вместо начального значения передаём функцию. она выполняется один раз при загрузке - достаёт задачи из localStorage. если там что-то есть - парсим из строки в объект, иначе возвращаем пустой объект

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleAddTasks = (newTasks) => {
    const dataKey = formatDate(selectedDay) // получаем ключ выбранного дня
    const dayTasks = tasks[dataKey] || [] // берем задачи этого дня, если их нет - пустой массив
    setTasks({
      ...tasks, // копируем все остальные дни без изменений
      [dataKey]: [...newTasks, ...dayTasks] // для выбранного дня - добавляем новую задачу в начало
    });
  };

  const handleDeleteTasks = (id) => {
    const dateKey = formatDate(selectedDay) 
    const dayTasks = tasks[dateKey] || []
    setTasks({
      ...tasks, 
      [dateKey]:dayTasks.filter(task => task.id !== id)
    })
  }
  const [dataLoaded, setDataLoaded] = useState(false)
  const [notes, setNotes] = useState({})

  useEffect(() => {
    if (!userId) return //Ждём пока узнаем пользователя

    const loadData = async () => {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)
  
      if (docSnap.exists()) {
        const data = docSnap.data()
        setTasks(docSnap.data().tasks || {})
        setNotes(docSnap.data().notes || {})
      } else {
        setTasks({})
        setNotes({})
      }
      setDataLoaded(true)
    }
    loadData()
  }, [userId])
  useEffect(() => {
    if (!userId || !dataLoaded) return

    const saveData = async () => {
      try {
        await setDoc(doc(db, 'users', userId), {
          tasks,
          notes
        }, { merge: true })
      } catch (e) {
        console.error('Ошибка сохранения:', e)
      }
    }

    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);

  }, [tasks, notes, userId, dataLoaded])

  const handleAddNote = (newNote) => {
    const dataKey = formatDate(selectedDay)
    setNotes({
      ...notes,
      [dataKey]: newNote
    })
  }

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
  const currentDayNotes = notes[dateKey] || ''

  const today = new Date()
  const todayFormatted = formatDate(today)

  const [isMonthOpen, setIsMonthOpen] = useState(false) // useState для открытия календаря на месяц
  const [currentMonth, setCurrentMonth] = useState(new Date()) // текущий месяц

  const  prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)) // функция  для переключения на предыдущий месяц
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)) // функция для переключения на следующий месяц
  }

  const handleUpdateTime = async (taskId, newTime) => {
    const dataKey = formatDate(selectedDay)
    const dayTasks = tasks[dataKey] || []

    const updateDayTasks = dayTasks.map(t => 
      t.id === taskId ? { ...t, time: newTime } : t
    )

    const newTasksState = {
      ...tasks, 
      [dateKey]: updateDayTasks
    }

    setTasks(newTasksState)

    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, { tasks: newTasksState }, { merge: true })
  }

  return (
    <div className="app-container">
      <Header
        title={`Сегодня, ${todayFormatted.slice(0, 5)}`}
        leftIcon={notesIcon}
        onLeftClick={() => navigate('/notes')}
        onRightClick={() => setIsMonthOpen(!isMonthOpen)}
        rightIcon={calendar}
      />

      <div className="week-strip">
        {weekDays.map((day, index) => {
          const dayKey = formatDate(day)
          const hasTasks = tasks[dayKey]?.length > 0
          const hasNotes = !!notes[dayKey]

          return (
            <button
              key={index}
              className={`day-btn ${selectedDay.toDateString() === day.toDateString() ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <span>{dayNames[index]}</span>
              <span>{day.getDate()}</span>
              {(hasTasks || hasNotes) && <span className='day-dot'></span>}
            </button>
          )
        })}
      </div>

      {isMonthOpen && ( // функция открытия календаря на месяц
        <div className="month-calendar">
          <div className="month-header">
            {/* получение текущего месяца и года, и кнопки переключения */}
            <button className='toggle-month' onClick={prevMonth}>‹</button> 
            <span>{currentMonth.toLocaleString('ru', { month: 'long', year: 'numeric' })}</span> 
            <button className='toggle-month' onClick={nextMonth}>›</button>
          </div>
          {/* сетка дней */}
          <div className="month-grid"> 
            {dayNames.map((name, index) => (
              <div key={index} className="month-day-name">{name}</div> // проходимся по массиву дней неделип и отрисовываем их
            ))}
            {getMonthDays(currentMonth).map((day, index) => { // получаем массив дней месяца
              if (day === null) return <div key={index}></div> // пропускаем пустые ячейки
              const dayKey = formatDate(day) 
              const hasTasks = tasks[dayKey]?.length > 0
              const hasNotes = !!notes[dayKey]
              return (
                <button 
                    onClick={() => setSelectedDay(day)} 
                    className={`day-on-calendar 
                      ${selectedDay.toDateString() === day.toDateString() ? 'active' : ''}
                      ${hasTasks ? 'has-tasks' : ''}
                      ${hasNotes ? 'has-tasks' : ''}
                      `}
                    key={index}
                  >
                    <span>{day.getDate()}</span>
                  </button>
              )
            })}
          </div>
        </div>
      )}

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
          : <TaskList tasks={currentDayTasks} onToggle={handleToggleTask} onDelete={handleDeleteTasks} onMove={handleMoveTask} onUpdateTime={handleUpdateTime}/>
      ) : (
        <textarea
          className='note-textarea'
          value={currentDayNotes}
          onChange={e => handleAddNote(e.target.value)}
          placeholder='Напишите заметку'
        ></textarea>
      )}

      <Navbar activeTab='calendar' isChatCenter={false} onPlusClick={() => setIsModalOpen(true)} />
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
