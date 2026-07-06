import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase.js";
import { doc, getDocs, updateDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import Header from "../components/Header.jsx";
import backBtn from "../assets/arrow-left-long.svg";

function Notifications() {
    const [notifications, setNotifications] = useState([])
    const navigate = useNavigate()
    const [userId, setUserId] = useState(null)

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUserId(currentUser ? currentUser.uid : null)
        })
        return () => unsubscribe()
    }, [])

    useEffect(() => {
        if (!userId) return

        const loadNotifications = async () => {
            const notificationsRef = collection(db, 'users', userId, 'notifications')
            const snapshot = await getDocs(notificationsRef)
            const notificationsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setNotifications(notificationsList)
        }
        loadNotifications()
    }, [userId])

    const handleMarkAllRead = async () => {
        if (!userId) return

        const unreadNotifications = notifications.filter(n => !n.isRead)
        if (unreadNotifications.length === 0) {
            alert('Все уведомления уже прочитаны')
            return
        }

        try {
            for (const notification of unreadNotifications) {
                const notificationRef = doc(db, 'users', userId, 'notifications', notification.id)
                await updateDoc(notificationRef, { isRead: true })
            }
            setNotifications(notifications.map(n => ({ ...n, isRead: true })))
        } catch (error) {
            console.error('Ошибка при отметке уведомлений: ', error)
            alert('Не удалось отметить уведомления')
        }
    }

    return (
        <div className="app-container">
            <Header
                title="Уведомления"
                leftIcon={backBtn}
                onLeftClick={() => navigate(-1)}
            />

            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <p className="empty-text">Уведомлений пока нет...</p>
                ) : (
                    notifications.map(notification => (
                        <div key={notification.id} className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}>
                            <h3>{notification.title}</h3>
                            <p>{notification.message}</p>
                            <span className="notification-date">
                                {new Date(notification.createdAt?.toDate()).toLocaleDateString('ru-RU')}
                            </span>
                        </div>
                    ))
                )}
            </div>

            <Navbar
                activeTab="notifications"
                onMarkAllRead={handleMarkAllRead}
            />
        </div>
    )
}

export default Notifications;