import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const NOTIFICATION_TYPES = {
  welcome: {
    icon: "🎉",
    color: "#9c27b0",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  water_reminder: {
    icon: "💧",
    color: "#03a9f4",
    gradient: "linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%)",
  },
  walk_reminder: {
    icon: "🚶",
    color: "#4caf50",
    gradient: "linear-gradient(135deg, #81c784 0%, #388e3c 100%)",
  },
  task_reminder: {
    icon: "📝",
    color: "#ff9800",
    gradient: "linear-gradient(135deg, #ffb74d 0%, #f57c00 100%)",
  },
  streak: {
    icon: "🔥",
    color: "#f44336",
    gradient: "linear-gradient(135deg, #ef5350 0%, #c62828 100%)",
  },
};

export const createNotification = async (userId, notification) => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    await addDoc(notificationsRef, {
      ...notification,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Ошибка создания уведомления: ', error);
  }
};

export const seedTestNotifications = async (userId) => {
  const testNotifications = [
    {
      type: "welcome",
      title: "Добро пожаловать в OurSpace! 👋",
      message:
        "Привет! Я Павел, создатель этого приложения. Спасибо, что присоединился. Здесь ты сможешь отслеживать привычки, задачи и становиться лучше каждый день. Если приложение тебе понравится — поддержи меня через кнопку доната 💜",
    },
    {
      type: "water_reminder",
      title: "Время пить воду!",
      message: "Ты давно не пил воду. Выпей стакан прямо сейчас 💧",
    },
    {
      type: "walk_reminder",
      title: "Прогулка ждёт!",
      message: "Сегодня отличная погода для прогулки. Выйди на 30 минут 🌤️",
    },
    {
      type: "task_reminder",
      title: "Задача: Созвониться с клиентом",
      message: "Напоминание: через 15 минут у тебя запланирована задача",
    },
    {
      type: "streak",
      title: "Новый рекорд!",
      message: "Поздравляем! Твой стрик достиг 7 дней подряд! ",
    },
  ];

  for (const notification of testNotifications) {
    await createNotification(userId, notification);
  }

  console.log('Создано 5 тестовых уведомлений');
};