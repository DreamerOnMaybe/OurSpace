import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Settings.css"; // Не забудь создать файл стилей
import Header from "../components/Header.jsx";
import Navbar from "../components/Navbar.jsx";
import backIcon from '../assets/arrow-left-long.svg'

function Settings() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // единый стейт для настроек
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        city: ''
    })

    // загружаем текущие данные при входе
    useEffect(() => {
        const loadUserData = async () => {
            if (!auth.currentUser) return

            const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid))
            if (docSnap.exists()) {
                const data = docSnap.data()
                setFormData({
                    name: data.name || '',
                    bio: data.bio || '',
                    city: data.city || ''
                })
            }
            setLoading(false)
        }
        loadUserData()
    }, [])

    // функция сохранения
    const handleSave = async () => {
        setSaving(true)
        try {
            await setDoc(
                doc(db, 'users', auth.currentUser.uid),
                {
                    name: formData.name,
                    bio: formData.bio,
                    city: formData.city
                },
                { merge: true }
            )
            navigate('/profile')
        } catch (error) {
            console.error('Ошибка при сохранении:', error)
            alert('не удалось сохранить настройки')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="loading-screen">Загрузка...</div>

    return (
        <div className="app-container">
            <Header 
                title='Настройки'
                onLeftClick={() => navigate('/profile')}
                leftIcon={backIcon}
            />

            <div className="settings-content">
                <div className="settings-group">
                    <label>Имя профиля</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Как вас зовут?"
                    />
                </div>
                <div className="settings-group">
                    <label>Немного о себе</label>
                    <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Расскажите о себе"
                        rows='3'
                    />
                </div>
                <div className="settings-group">
                    <label>Город (для отображения погоды)</label>
                    <input 
                        type="text" 
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Например: Москва"
                    />
                </div>

                <button
                    className="save"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </div>
        </div>
    )
}

export default Settings