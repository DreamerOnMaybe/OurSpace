import React, { useState } from "react";
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import "./Auth.css";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('') // для уведомлений об отправке письма
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true) // состояние для чекбокса

  const getErrorMessage = (code) => {
    switch(code) {
      case 'auth/invalid-credential': return 'Неверный email или пароль'
      case 'auth/email-already-in-use': return 'Этот email уже используется'
      case 'auth/weak-password': return 'Пароль должен быть не менее 6 символов'
      case 'auth/invalid-email': return 'Неверный формат email'
      case 'auth/user-not-found': return 'Пользователь с таким Email не найден'
      default: return 'Что-то пошло не так, попробуйте снова'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      navigate('/')
    } catch (error) {
      setError(getErrorMessage(error.code))
    } finally {
      setLoading(false)
    }
  }

  // функция для сброса пороля
  const handleForgotPassword = async () => {
    if(!email) {
      setError('Введите  Email, чтобы получить ссылку для сброса')
      return
    }
    try {
      await sendPasswordResetEmail(auth, email)
      setMessage('Письмо с ссылкой для смены пароля отправлено на вашу почту')
      setError('')
    } catch {
      setError('Ошибка при отправке письма. проверьте правильность Email')
    }
  }

  return (
    <div className="login-container">   
      <div className="tabs-btns">
        <button
          className={isLogin ? "active" : ""}
          onClick={() => {setIsLogin(true); setError(''); setMessage('')}}
        >
          Вход
        </button>
        <button
          className={!isLogin ? "active" : ""}
          onClick={() => {setIsLogin(false); setError(''); setMessage('')}}
        >
          Регистрация
        </button>
      </div>
      <form className="register-form" id="registerForm" onSubmit={handleSubmit}>
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

        <div className="password-wrapper">
          <input
            className="password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Введите пароль"
          />
          <button
            className="password-btn"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👀'}
          </button>
        </div>

        {isLogin && (
          <div className="auth-extra">
            <label className="remember-me">
              <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
              <span>Запомнить меня</span>
            </label>
            <button className="forgot-password-link" type="button" onClick={handleForgotPassword}>
              Забыли пароль?
            </button>
          </div>
        )}

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}
        <button className="register-btn" type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : isLogin ? "Войти" : "Зарегистрироваться"}
        </button>
      </form>
    </div>
  );
}

export default Auth;
