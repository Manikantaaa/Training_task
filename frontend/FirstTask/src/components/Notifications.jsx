import React, { useContext, useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import axios from 'axios';
import '../styles/Notifications.css';
import AuthContext from '../context/AuthContext';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatDateTime = (createdAt) => {
  const now = new Date();
  const date = new Date(createdAt.replace(" ", "T"));

  const isToday =
    date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.toDateString() === yesterday.toDateString();

  const options = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const timeStr = date.toLocaleTimeString(undefined, options);

  if (isToday) return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;

  const dateStr = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return `${dateStr}, ${timeStr}`;
};




const Notifications = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    fetchNotifications();
  }, []);

 const fetchNotifications = async () => {
    try {
      const notifRes = await axios.get(`${API_BASE_URL}/notifications`);
      const systemNotifications = notifRes.data;

      const birthdayRes = await axios.get(`${API_BASE_URL}/birthdays`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const birthdayNotifs = birthdayRes.data.map((emp) => ({
        id: `${emp.id}`,
created_at: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        title: "🎉 Birthday Notification",
        description:
          emp.id === user.id
            ? `🎂 Wish you a happy birthday ${emp.name}!`
            : `🎉 Today is ${emp.name}'s birthday.`,
      }));

      setNotifications([...birthdayNotifs, ...systemNotifications]);
    } catch (error) {
      console.error("Failed to fetch notifications:", error.message);
    }
  };

  return (
    <>

    <div className="notification-panel">
      <div className="notification-header">
        <h2>Notifications</h2>
        <IoClose onClick={onClose} size={24} className="close-btn" />
      </div>
      <div className="notification-content">
        {notifications.map((item) => (
          <div key={item.id} className="notification-item">
                        <p className="notification-time">{formatDateTime(item.created_at)}</p>
<p className="notification-title"><strong>{item.title}</strong></p>
            <p className="notification-desc">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default Notifications;
