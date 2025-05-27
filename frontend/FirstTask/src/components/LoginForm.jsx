import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/useAuth';
import '../styles/Login.css';
import axios from 'axios';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const validate = () => {
    const newErrors = {};
    let firstInvalid = null;

    const addError = (field, message) => {
      newErrors[field] = message;
      if (!firstInvalid) firstInvalid = field;
    };

    if (!email.trim()) {
      addError('email', 'Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addError('email', 'Enter a valid email address');
    }

    if (!password.trim()) {
      addError('password', 'Password is required');
    }

    setErrors(newErrors);
    setServerError('');

    return { isValid: Object.keys(newErrors).length === 0, firstInvalid };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, firstInvalid } = validate();

    if (!isValid) {
      const focusMap = {
        email: emailRef,
        password: passwordRef
      };
      focusMap[firstInvalid]?.current?.focus();
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/login`, { email, password });
      if (res.data.user && res.data.token) {
        login(res.data.user, res.data.token);
        navigate('/dashboard');
      } else {
        setServerError(res.data.message || res.data.Error || "Login failed");
      }
    }catch (error) {
  console.error('Login error:', error);
    setServerError("Server error. Please try again.");
  }
}

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');

    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
  };

  return (
    <form className="login-container" onSubmit={handleSubmit}>
      <h2>Login</h2>

      <label>Email:</label>
      <input
        ref={emailRef}
        type="email"
        name="email"
        value={email}
        onChange={handleChange}
        placeholder="Enter your email"
      />
      {errors.email && <span className="error">{errors.email}</span>}

      <label>Password:</label>
      <input
        ref={passwordRef}
        type="password"
        name="password"
        value={password}
        onChange={handleChange}
        placeholder="Enter your password"
      />
      {errors.password && <span className="error">{errors.password}</span>}

      {serverError && <span className="error server-error">{serverError}</span>}

      <button type="submit">Login</button>

      <p className="link-text">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </form>
  );
};

export default LoginForm;
