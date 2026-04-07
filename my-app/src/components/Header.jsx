import settings from "../assets/settings.svg";
import logOut from "../assets/log-out.svg";

function Header({ title, onRightClick, rightIcon }) {
  return (
    <header className="header">
      <button className="grey-btn">
        <img src={settings} alt="Назад" />
      </button>
      <h2>{title}</h2>
      <button className="grey-btn" type="submit" onClick={onRightClick}>
        <img src={rightIcon || logOut} alt="Профиль" />
      </button>
    </header>
  );
} 

export default Header;