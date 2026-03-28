import React, { useState } from "react";
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import "./Auth.css";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      navigate('/')
    } catch (error) {
      console.log(error.message)
    } finally {
      setLoading(false)
    }
  }

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
      <form id="registerForm" onSubmit={handleSubmit}>
        {!isLogin && 
          <input 
            type="text" 
            placeholder="Ваше имя" 
            value={name}
            onChange={e => setName(e.target.value)}
          />
        }
        <input 
          className="email"
          type="email" 
          id="email" 
          name="email" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Ваш Email"
        />

        <input
          className="password"
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Введите пароль"
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : isLogin ? "Войти" : "Зарегистрироваться"}
        </button>
      </form>
    </div>
  );
}

export default Auth;
