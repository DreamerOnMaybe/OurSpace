import { useState } from 'react'

function SettingsModal({ maxGlasses, maxSteps, notificationSettings, onSave, onClose }) {
    const [glasses, setGlasses] = useState(maxGlasses)
    const [steps, setSteps] = useState(maxSteps)
    const [waterReminders, setWaterReminders] = useState(notificationSettings?.water ?? true)

    const handleSave = () => {
        onSave(glasses || 10, steps || 10000, { water: waterReminders })
        onClose()
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>Настройки</h3>

                <label>Цель по воде(Стаканы)</label>
                <input type="number"
                    value={glasses}
                    onChange={e => setGlasses(e.target.value === '' ? '' : Number(e.target.value))}
                    min='1'
                    max='20'
                />

                <label>Цель по шагам</label>
                <input type="number"
                    value={steps}
                    onChange={e => setSteps(e.target.value === '' ? '' : Number(e.target.value))}
                    min='1000'
                    max='50000'
                />

                <div className="time-toggle-container">
                    <span>Напоминания о воде</span>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={waterReminders}
                            onChange={e => setWaterReminders(e.target.checked)}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>

                <div className="add-modal-btns">
                    <button className="close" onClick={onClose}>Отмена</button>
                    <button onClick={() => { onSave(glasses || 10, steps || 10000); onClose() }}>Сохранить</button>
                </div>
            </div>
        </div>
    )
}

export default SettingsModal