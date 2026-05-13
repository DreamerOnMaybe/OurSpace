import settings from "../assets/settings.svg";

function Header({ title, onRightClick, rightIcon, onLeftClick, leftIcon }) {
  return (
    <header className="header">
      <button className="grey-btn" onClick={onLeftClick}>
        <img src={leftIcon || settings} alt="" />
      </button>
      <h2>{title}</h2>
      {rightIcon && (
        <button className="grey-btn" onClick={onRightClick}>
          <img src={rightIcon} alt="" />
        </button>
      )}
    </header>
  );
}

export default Header;
