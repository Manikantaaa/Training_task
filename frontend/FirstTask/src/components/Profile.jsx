import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from "../context/AuthContext";
import "../styles/profile.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Profile = () => {
  const { user } = useContext(AuthContext);
const navigate=useNavigate();
   const handleEdit = (employee) => {
    navigate("/edit-profile", { state: { employee } });
  };
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-image">
          <img
  src={`${API_BASE_URL}/Images/${user.image}`}
            alt="Profile"
            className="profile-img"
          />
        </div>
        <div className="profile-details">
          <h2 className="profile-title">My Profile</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>DOB:</strong> {new Date(user.dob).toLocaleDateString('en-GB')}</p>

          {user.role !== 'admin' && (
            <>
              <p><strong>Type:</strong> {user.type}</p>
             <button onClick={() => handleEdit(user)} className='edit-link'>Edit</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
