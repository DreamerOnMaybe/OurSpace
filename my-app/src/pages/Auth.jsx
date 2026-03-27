import React, { useState } from "react";
import "./Auth.css";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  return (
    <div className="login-container">   
      <div className="tabs-btns">
        <button
          className={isLogin ? "active" : ""}
          onClick={() => setIsLogin(true)}
        >
          Вход
        </button>
        <button
          className={!isLogin ? "active" : ""}
          onClick={() => setIsLogin(false)}
        >
          Регистрация
        </button>
      </div>
      <form id="registerForm">
        {!isLogin && 
          <input 
            type="text" 
            placeholder="Ваше имя" 
            value={name}
            onChange={e => setName(e.target.value)}
          />
        }
        <input 
          type="email" 
          id="email" 
          name="email" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Ваш Email"
        />

        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Введите пароль"
        />

        <button type="submit">
          {isLogin ? "Войти" : "Зарегистрироваться"}
        </button>
      </form>
    </div>
  );
}

export default Auth;
