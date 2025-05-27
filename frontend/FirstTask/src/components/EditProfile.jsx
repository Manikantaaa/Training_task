import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthContext from "../context/AuthContext";
import axios from 'axios';
import "../styles/EditProfile.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditProfile = () => {
  const location = useLocation();
  const { employee } = location.state || {};
  const { user, setUser, token } = useContext(AuthContext);
  const [editData, setEditData] = useState(null);
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
useEffect(() => {
  if (employee) {
    setEditData({ ...employee });
  }
}, [employee]);

 if (!editData) return <div>Loading...</div>; 

  const validate = () => {
    const newErrors = {};

    if (!editData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!editData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }
       else if (!editData.phone.match(/^\d{10}$/)) newErrors.phone = "Phone number must be 10 digits";

if (!editData.email.trim()) {
      newErrors.email = "Email is required.";
    }
    else if (!/^\S+@\S+\.\S+$/.test(editData.email)) {
      newErrors.email = "Please enter a valid email.";
    }

    if (editData.role !== 'admin' && !editData.type) {
      newErrors.type = "Please select a type.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append('name', editData.name);
    formData.append('email', editData.email);
    formData.append('phone', editData.phone);
    formData.append('type', editData.type);
    if (image) formData.append('image', image);

    try {
      await axios.put(`${API_BASE_URL}/${editData.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (editData.id === user.id) {
        const res=await axios.get(`${API_BASE_URL}/getbyid/${editData.id}`)
        setUser(res.data[0]);

      }
      setEditData(null)
      alert("Profile updated successfully.");
if (user.role === 'admin') {
  navigate('/dashboard');
} else {
  navigate('/profile');
}

    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

    const handleImagePreview = (e) => {
    setImage(e.target.files[0]);
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>

      <div className="form-group">
        <label>Name:</label>
        <input
          type="text"
          value={editData.name}
          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          placeholder="Enter your name"
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>Phone:</label>
        <input
          type="number"
          value={editData.phone}
          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
          placeholder="Enter your phone number"
        />
        {errors.phone && <span className="error">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={editData.email}
          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
          placeholder="Enter your email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      {editData.role !== 'admin' && (
        <div className="form-group">
          <label>Type:</label>
          <select
            value={editData.type}
            onChange={(e) => setEditData({ ...editData, type: e.target.value })}
          >
            <option value="">Select Type</option>
            <option value="Developer">Developer</option>
            <option value="Tester">Tester</option>
          </select>
          {errors.type && <span className="error">{errors.type}</span>}
        </div>
      )}

     <div className="form-group">
  <label>Profile Image</label>
  <input
    type="file"
    onChange={handleImagePreview}
  />

  {/* Show previous image if available */}
  {editData.image && !image && (
    <div className="image-preview">
      <label>Current Image:</label>
      <img 
        src={`${API_BASE_URL}/Images/${editData.image}`} 
        alt="Current Profile" 
        className="preview-img" 
      />
    </div>
  )}

  {image && (
    <div className="image-preview">
      <label>Selected Image:</label>
      <img 
        src={URL.createObjectURL(image)} 
        alt="Selected Profile" 
        className="preview-img" 
      />
    </div>
  )}
</div>


      <button onClick={handleUpdate}>Update</button>
    </div>
  );
};

export default EditProfile;
