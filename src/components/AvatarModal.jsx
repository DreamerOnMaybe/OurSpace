import { avatars } from '../assets/avatars/index.js'
import './AvatarModal.css'

function AvatarModal({ onSelect, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>Выберите автар</h3>
                <div className="avatars-grid">
                    {avatars.map((avatar, index) => (
                        <button key={index} onClick={() => { onSelect(avatar); onClose() }}>
                            <img src={avatar} alt="" />
                        </button>
                    ))}
                </div>
                <button className='close' onClick={onClose}>Отмена</button>
            </div>
        </div>
    )
}

export default AvatarModal