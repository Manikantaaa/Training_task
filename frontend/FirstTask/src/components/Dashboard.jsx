import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import fetchUsers from "./fetchUsers.jsx";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Dashboard() {
  const { user, logout, token } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
const [banners, setBanners] = useState([]);
 const navigate = useNavigate();

const isAdmin = user.role=== "admin";
useEffect(() => {
  const loadUsers = async () => {
    await fetchUsers(isAdmin, token, logout, setAdmins, setEmployees);
  };
const fetchBanners = async () => {
    try {
const res = await axios.get(`${API_BASE_URL}/banners`);

      setBanners(res.data);
    } catch (err) {
      console.error("Failed to load banners", err);
    }
  };

  fetchBanners();
  loadUsers();
}, [user, token, logout]);

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;

    try {
      if (id === user.id) {
       await axios.delete(`${API_BASE_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        alert("Your account has been deleted. You will be logged out.");
        logout();
        localStorage.removeItem("user");
        navigate("/");
      } else {
        await axios.delete(`${API_BASE_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers(isAdmin, token, logout, setAdmins, setEmployees);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete user.");
    }
  };

  const handleEdit = (employee) => {
    navigate("/edit-profile", { state: { employee } });
  };

  return (
    <>
 
{!isAdmin && banners.length > 0 && (
  <div className="carousel-wrapper">
    <Carousel
      autoPlay
      infiniteLoop
      showThumbs={false}
      showStatus={false}
      interval={2000}
      dynamicHeight={false}
          showArrows={false}

    >
      {banners.map((banner, index) => (
        <div key={index} className="banner-slide">
          <img
src={`${API_BASE_URL}/Banners/${banner.filename}`} 
            alt={`banner-${index}`}
            className="banner-image"
          />
        </div>
      ))}
    </Carousel>
  </div>
)}

<div className="dashboard-header">
  <div className="dashboard-header-bar">
    <h3>{isAdmin ? "All Users" : "Employee List"}</h3>
    <input
      type="text"
      placeholder="Search by name or email"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="search-input"
    />
  </div>

  <table border="1">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>DOB</th>
        <th>Role</th>
        <th>Image</th>
        {isAdmin && <th>Actions</th>}
      </tr>
    </thead>
    <tbody>
      {(isAdmin ? [...admins, ...employees] : employees)
        .filter((u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((u) => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{u.phone}</td>
            <td>{new Date(u.dob).toLocaleDateString("en-GB")}</td>
            <td>{u.role || u.type}</td>
            <td>
              <img
 src={`${API_BASE_URL}/Images/${u.image}`}
                 alt={u.name}
              />
            </td>
            {isAdmin && (
              <td className="actions">
                <button onClick={() => handleEdit(u)}>Edit</button>
                <button onClick={() => handleDelete(u.id)}>Delete</button>
              </td>
            )}
          </tr>
        ))}
    </tbody>
  </table>
</div>

    </>
  );
}

export default Dashboard;
