import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import '../styles/Login.css'; 
import axios from 'axios';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/login',{email,password})
      if (res.data.user && res.data.token) {
        login(res.data.user, res.data.token);
        navigate('/dashboard');
      } else {
        alert(res.data.message || res.data.Error || "Login failed");
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <form className="login-container" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
      <p className="link-text">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
          </form>
  );
};

export default LoginForm;
