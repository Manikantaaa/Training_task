import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css'; 
import AuthContext from '../context/AuthContext';
import { FiBell } from "react-icons/fi"; 
import { useState } from 'react';
import Notifications from './Notifications';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Navbar = () => {
  const navigate = useNavigate();
  const { user,logout } = useContext(AuthContext);
    const [showNotifications, setShowNotifications] = useState(false);

const isAdmin = user.role === "admin";
  

return (
    <nav className="navbar">
      <div className="navbar-left">
        <img
  src={`${API_BASE_URL}/Images/${user.image}`}
          alt="Profile"
          className="profile-pic"
        />
                <button onClick={() => navigate('/dashboard')} className="nav-btn">Dashboard</button> 
<button onClick={() => navigate('/profile')} className="nav-btn">My Profile</button> 
      </div>

     

      <div className="navbar-right">
       {isAdmin&&(<>
       <button onClick={() => navigate('/add-employee')} className="nav-btn">Add Employee</button>
        <button onClick={() => navigate('/manage-notifications')} className="nav-btn">Manage Notifications</button>
        <button onClick={() => navigate('/image-uploads')} className="nav-btn">Company Banners</button>

       </>)} 
        {!isAdmin&&(<>
        <button className="nav-btn" onClick={() => setShowNotifications(!showNotifications)}>
        <FiBell size={24} />
      </button>

      {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}
    </>
       )} 
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
