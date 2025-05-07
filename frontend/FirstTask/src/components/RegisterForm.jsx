import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Registration.css'; 
import axios from 'axios';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    type: '',
    dob: '',
    image: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (let key in formData) {
      data.append(key, formData[key]);
    }

    try {
       const res =await axios.post('http://localhost:3000/api/register',data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
    }})

      console.log(res.data.message);
      navigate('/');
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <form className="register-container" onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
      <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
      <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required />
      <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
      
      <div className="radio-group">
        <label>
          <input type="radio" name="role" value="admin" checked={formData.role === 'admin'} onChange={handleChange} required/> Admin
        </label>
        <label>
          <input type="radio" name="role" value="employee" checked={formData.role === 'employee'} onChange={handleChange} /> Employee
        </label>
      </div>

      <select name="type" value={formData.type} onChange={handleChange} disabled={formData.role === 'admin'} required>
      <option value="">Select role type</option>
        <option value="Developer">Developer</option>
        <option value="Tester">Tester</option>
      </select>

      <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />

      <div className="file-input">
        <label>Select Image</label>
        <input type="file" name="image" accept="image/*" onChange={handleChange} required />
      </div>

      <button type="submit">Register</button>

      <p className="link-text">
        Already have an account? <Link to="/">Login here</Link>
      </p>
    </form>
  );
};

export default RegisterForm;
