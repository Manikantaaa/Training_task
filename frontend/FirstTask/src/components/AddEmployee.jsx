import React, { useState, useRef } from 'react';
import axios from 'axios';
import "../styles/AddEmployee.css";
import { useNavigate } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'employee',
    type: '',
    dob: '',
    image: '',
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

 const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const typeRef = useRef(null);
  const dobRef = useRef(null);
  const imageRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

const handleChange = (e) => {
  const { name, value, files } = e.target;

  if (name === 'image') {
    const file = files[0];
    setFormData({ ...formData, image: file });
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: '' }));
  } else {
    setFormData({ ...formData, [name]: value });

    let errorMsg = '';

    if (name === 'phone') {
      if (!value.trim()) errorMsg = 'Phone number is required';
      else if (!/^\d{10}$/.test(value)) errorMsg = 'Phone number must be 10 digits';
    }

    if (name === 'password') {
      if (!value.trim()) errorMsg = 'Password is required';
      else if (value.length < 6) errorMsg = 'Password must be at least 6 characters';
    }

    if (name === 'email') {
      if (!value.trim()) errorMsg = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = 'Valid email is required';
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  }
};


const validate = () => {
  const newErrors = {};
  let firstInvalid = null;

  const addError = (field, message) => {
    newErrors[field] = message;
    if (!firstInvalid) firstInvalid = field; 
  };

  if (!formData.name.trim()) addError("name", "Name is required");
  if (!formData.email.trim()) addError("email", "Email is required");
  else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) addError("email", "Valid email is required");

  if (!formData.phone.trim()) addError("phone", "Phone number is required");
  else if (!formData.phone.match(/^\d{10}$/)) addError("phone", "Phone number must be 10 digits");

  if (!formData.password.trim()) addError("password", "Password is required");
  else if (formData.password.length < 6) addError("password", "Password must be at least 6 characters");

  if (!formData.type) addError("type", "Type is required ");

  if (!formData.dob) addError("dob", "Date of birth is required");
  if (!formData.image) addError("image", "Image is required");

  setErrors(newErrors);
  return { isValid: Object.keys(newErrors).length === 0, firstInvalid };
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const { isValid, firstInvalid } = validate();

  if (!isValid) {
    const focusMap = {
      name: nameRef,
      email: emailRef,
      phone: phoneRef,
      password: passwordRef,
      type: typeRef,
      dob: dobRef,
      image: imageRef
    };

    
      focusMap[firstInvalid]?.current?.focus();
    
    return;
  }

  const data = new FormData();
  for (let key in formData) {
    data.append(key, formData[key]);
  }

  try {
    await axios.post(`${API_BASE_URL}/register`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    navigate('/dashboard'); 
  } catch (error) {
    if (error.response && error.response.status === 409) {
      setErrors((prev) => ({ ...prev, email: error.response.data.error }));
      emailRef.current?.focus(); 
    } else {
      console.error("Registration failed:", error);
      alert("Something went wrong. Please try again.");
    }
  }
};

  return (
    <>
      <h1>Add Employee</h1>
      <form className="register-container" onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          ref={nameRef}
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter Name"
        />
        {errors.name && <span className="error">{errors.name}</span>}

        <label>Email:</label>
        <input
          ref={emailRef}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter Email"
        />
        {errors.email && <span className="error">{errors.email}</span>}

        <label>Phone Number:</label>
        <input
          ref={phoneRef}
          name="phone"
          type="number"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter Phone Number"
        />
        {errors.phone && <span className="error">{errors.phone}</span>}

        <label>Password:</label>
        <input
          ref={passwordRef}
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter Password"
        />
        {errors.password && <span className="error">{errors.password}</span>}

        <label>Type:</label>
        <select
          ref={typeRef}
          name="type"
          value={formData.type}
          onChange={handleChange}
          disabled={formData.role === 'admin'}
        >
          <option value="">Select role type</option>
          <option value="Developer">Developer</option>
          <option value="Tester">Tester</option>
        </select>
        {errors.type && <span className="error">{errors.type}</span>}

        <label>Date of Birth:</label>
        <input
          ref={dobRef}
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          max={today}
        />
        {errors.dob && <span className="error">{errors.dob}</span>}

        <label>Select Image:</label>
        <input
          ref={imageRef}
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />
        {errors.image && <span className="error">{errors.image}</span>}

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
          </div>
        )}

        <button type="submit">Register</button>
      </form>
    </>
  );
};

export default AddEmployee;
