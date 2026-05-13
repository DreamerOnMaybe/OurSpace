import { useNavigate } from "react-router-dom";

import home from "../assets/home.svg";
import user from "../assets/user.svg";
import plus from "../assets/plus.svg";
import calendar from "../assets/calendar.svg";
import bellNotification from "../assets/bell-notification.svg";
import chat from "../assets/chat.svg"

function Navbar({ activeTab, onPlusClick, isChatCenter = false }) {
  const navigate = useNavigate();

  return (
    <nav className="nav-bar">
      <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => navigate("/")}>
        <img src={home} alt="Кнопка домой" />
      </button>
      <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => navigate("/profile")}>
        <img src={user} alt="Кнопка в профиль" />
      </button>
      <button className={`nav-item plus ${isChatCenter ? 'chat' : ''}`} onClick={() => onPlusClick()}>
        <img src={isChatCenter ? chat : plus} alt="Кнопка Чата" />
      </button>
      <button className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => navigate("/calendar")}>
        <img src={calendar} alt="Кнопка календарь" />
      </button>
      <button className="nav-item">
        <img src={bellNotification} alt="Кнопка уведомлений" />
      </button>
    </nav>
  );  
}

export default Navbar
