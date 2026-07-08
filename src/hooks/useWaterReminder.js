import { useEffect, useRef } from 'react';
import { createNotification } from '../utils/notificationsHelper';

const WATER_REMINDER_INTERVAL = 2 * 60 * 60 * 1000
const CHECK_INTERVAL = 60 * 1000

export const useWaterReminder = (userId, glasses, notificationSettings) => {
    const lastDrinkTimeRef = useRef(null)
    const lastReminderTimeRef = useRef(null)

    useEffect(() => {
        if (!userId) return

        const LAST_DRINK_KEY = `last_drink_${userId}`
        const LAST_REMINDER_KEY = `last_reminder_${userId}`

        const lastDrink = localStorage.getItem(LAST_DRINK_KEY)
        const lastReminder = localStorage.getItem(LAST_REMINDER_KEY)

        if (lastDrink) lastDrinkTimeRef.current = parseInt(lastDrink)
        if (lastReminder) lastReminderTimeRef.current = parseInt(lastReminder)
    }, [userId])

    const saveTimestamps = async (lastDrink, lastReminder) => {
        if (!userId) return

        const LAST_DRINK_KEY = `last_drink_${userId}`
        const LAST_REMINDER_KEY = `last_reminder_${userId}`

        if (lastDrink !== null) {
            localStorage.setItem(LAST_DRINK_KEY, lastDrink.toString())
        }
        if (lastReminder !== null) {
            localStorage.setItem(LAST_REMINDER_KEY, lastReminder.toString())
        }
    }

    useEffect(() => {
        if (glasses > 0) {
            const now = Date.now()
            lastDrinkTimeRef.current = now
            saveTimestamps(now, lastReminderTimeRef.current)
            console.log('Таймер воды сброшен: пользователь выпил стакан')
        }
    }, [glasses])

    useEffect(() => {
        if (!userId || !notificationSettings?.water) {
            console.log('Напоминание о воде отключено')
            return
        }

        const checkInterval = setInterval(async () => {
            const now = Date.now()
            const lastDrink = lastDrinkTimeRef.current
            const lastReminder = lastReminderTimeRef.current

            const timeSinceLastDrink = lastDrink ? now - lastDrink : Infinity
            const timeSinceLastReminder = lastReminder ? now - lastReminder : Infinity

            console.log(`Проверка воды: прошло ${timeSinceLastDrink / 1000 / 60} мин с последнего стакана, ${timeSinceLastReminder / 1000 / 60} мин с последнего напоминания`);

            if (timeSinceLastDrink >= WATER_REMINDER_INTERVAL && timeSinceLastReminder >= WATER_REMINDER_INTERVAL) {
                console.log('Создаём напоминание о воде')

                await createNotification(userId, {
                    type: 'water_reminder', 
                    title: 'Время пить воду!💧',
                    message: 'Не забывай поддержать водный баланс'
                })

                lastReminderTimeRef.current = now
                saveTimestamps(lastDrink, now)
            }
        }, CHECK_INTERVAL)
        return () => clearInterval(checkInterval)
    }, [userId, notificationSettings?.water])
}