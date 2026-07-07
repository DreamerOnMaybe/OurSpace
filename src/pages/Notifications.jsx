import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase.js";
import { doc, getDocs, updateDoc, collection, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { seedTestNotifications } from "../utils/notificationsHelper";
import { NOTIFICATION_TYPES } from "../utils/notificationsHelper";

import Navbar from "../components/Navbar.jsx";
import Header from "../components/Header.jsx";
import backBtn from "../assets/arrow-left-long.svg";
import "./Notifications.css";

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

    const handleDeleteNotification = async (notificationId) => {
        if (!userId) return;

        const confirmDelete = window.confirm('Удалить это уведомление?');
        if (!confirmDelete) return;

        try {
            const ref = doc(db, "users", userId, "notifications", notificationId);
            await deleteDoc(ref);
            setNotifications(notifications.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Ошибка при удалении уведомления:', error);
            alert('Не удалось удалить уведомление');
        }
    };

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
                    notifications.map((notification) => {
                        const typeConfig = NOTIFICATION_TYPES[notification.type] || {
                            icon: "🔔",
                            color: "#9e9e9e",
                            gradient: "linear-gradient(135deg, #bdbdbd 0%, #757575 100%)",
                        };

                        const createdAt = notification.createdAt?.toDate
                            ? notification.createdAt.toDate()
                            : new Date();

                        return (
                            <div
                                key={notification.id}
                                className={`notification-card ${notification.isRead ? "read" : "unread"}`}
                                data-type={notification.type}
                                onClick={async () => {
                                    if (!notification.isRead) {
                                        try {
                                            const ref = doc(db, "users", userId, "notifications", notification.id);
                                            await updateDoc(ref, { isRead: true });
                                            setNotifications(
                                                notifications.map((n) =>
                                                    n.id === notification.id ? { ...n, isRead: true } : n
                                                )
                                            );
                                        } catch (error) {
                                            console.error('Ошибка при отметки уведомления: ', error)
                                            setNotifications(
                                                notifications.map((n) =>
                                                    n.id === notification.id ? { ...n, isRead: true } : n
                                                )
                                            );
                                        }
                                    }
                                }}
                            >
                                <div
                                    className="notification-icon"
                                    style={{ background: typeConfig.gradient }}
                                >
                                    {typeConfig.icon}
                                </div>

                                <div className="notification-content">
                                    <div className="notification-header">
                                        <h3 className="notification-title">{notification.title}</h3>
                                        <span className="notification-date">
                                            {createdAt.toLocaleDateString("ru-RU", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                        <button
                                            className="delete-notification-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteNotification(notification.id);
                                            }}
                                            title="Удалить"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    <p className="notification-message">{notification.message}</p>
                                </div>
                            </div>
                        );
                    })
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