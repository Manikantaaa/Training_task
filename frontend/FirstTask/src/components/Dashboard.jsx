import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import Modal from "./Modal.jsx";
import NotificationModal from "./NotificationModal";

import "../styles/Dashboard.css";
import "../styles/Registration.css";
import "../styles/Notifications.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user, setUser, logout, token } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editData, setEditData] = useState({});
  const [image, setImage] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [shownotifications, setShownotifications] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [notifForm, setNotifForm] = useState({
    title: "",
    description: "",
    image: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "employee",
    type: "",
    dob: "",
    password: "",
    image: "",
  });
    const isAdmin = user.role === "admin";
  const navigate = useNavigate();

useEffect(() => {
  fetchUsers();
  fetchNotifications();
});


  const fetchUsers =async () => {
    const endpoint = isAdmin ? "api" : "api/employees";
    await axios
      .get(`http://localhost:3000/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;

        if (isAdmin) {
          setAdmins(data.filter((u) => u.role === "admin"));
          setEmployees(data.filter((u) => u.role === "employee"));
        } else {
          setEmployees(data); 
        }
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        if (err.response?.status === 401) {
          alert("Session expired. Please login again.");
          logout();
        }
      });
  };
  

 const fetchNotifications = async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(res.data);
  } catch (err) {
    console.error("Failed to fetch notifications", err);
  }
};


  const handleCreateNotification = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", notifForm.title);
    formData.append("description", notifForm.description);
    formData.append("image", notifForm.image);

    try {
      if (editMode) {
        await axios.put(
          `http://localhost:3000/api/notifications/${editId}`,
          formData
        );
        setEditMode(false);
        setEditId(null);
      } else {
        await axios.post("http://localhost:3000/api/notifications", formData,{
  headers: { "Content-Type": "multipart/form-data" }});
      }
      fetchNotifications(); 
      setNotifForm({ title: "", description: "", image: null });
      setShowCreateForm(false);
    } catch (err) {
      console.error("Notification submit error:", err);
      alert("Failed to submit notification.");
    }
  };

  const handleDeleteNotification = async (id) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this notification?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:3000/api/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete notification.");
    }
  };

    const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("role", formData.role);
      data.append("type", formData.type);
      data.append("dob", formData.dob);
      data.append("password", formData.password); 
      data.append("image", formData.image); 

      await axios.post("http://localhost:3000/api/register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Employee added successfully");
      setShowAddForm(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        type: "",
        role: "employee",
        dob: "",
        password: "",
        image: "",
      });
      fetchUsers(); 
    } catch (err) {
      console.error("Error adding user:", err);
      alert("Failed to add user");
    }
  };

  const handleDelete = async (id) => {
  const confirmDelete = confirm("Are you sure you want to delete?");
  if (!confirmDelete) return;

  try {
    if (id === user.id) {
      await axios.delete(`http://localhost:3000/api/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Your account has been deleted. You will be logged out.");
      logout(); 
      localStorage.removeItem("user"); 
      navigate('/');
    } else {
      await axios.delete(`http://localhost:3000/api/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("Failed to delete user.");
  }
};


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const handleEdit = (u) => {
    setEditData({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      type: u.type || "",
      role: u.role,
    });

    setShowProfile(true);
    setIsEditing(true);
  };

  const handleMyProfile = () => {
    setEditData({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      type: user.type || "",
      dob: user.dob,
    });
    setShowProfile(true);
    setIsEditing(false);
  };

  const handleUpdate = async () => {
    try {
      const D = new FormData();
      D.append("name", editData.name);
      D.append("email", editData.email);
      D.append("phone", editData.phone);
      D.append("type", editData.type);
      if (image) D.append("image", image);

      await axios.put(`http://localhost:3000/api/${editData.id}`, D, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (editData.id === user.id) {
        const updatedUser = { ...user, ...editData };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      alert("Profile updated");
      setShowProfile(false);
      setIsEditing(false);

      fetchUsers();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile");
    }
  };

  return (
    <>
      <div className="dashboard-header">
        <h2>
          Welcome, {user.name} ({user.role})
        </h2>
        <div className="dashboard-buttons">
          <button onClick={handleMyProfile}>My Profile</button>
          {isAdmin ? (
            <>
              <button onClick={() => setShowAddForm(true)}>Add Employee</button>
              <button onClick={() => setShowNotificationPopup(true)}>
                Manage Notifications
              </button>
            </>
          ) : (
            <button onClick={() => setShownotifications(true)}>
              Notifications
            </button>
          )}{" "}
          <button onClick={logout}>Logout</button>
        </div>

        {isAdmin && (
          <>
            <h3>Admin List</h3>
            <table border="1">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>DOB</th>
                  <th>Role</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>{new Date(u.dob).toLocaleDateString("en-GB")}</td>
                    <td>{u.role}</td>
                    <td>
                      <img src={`http://localhost:3000/Images/${u.image}`} />
                    </td>
                    <td className="actions">
                      <button onClick={() => handleEdit(u)}>Edit</button>
                      <button onClick={() => handleDelete(u.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Employee List</h3>
            <table border="1">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>DOB</th>
                  <th>Type</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>{new Date(u.dob).toLocaleDateString("en-GB")}</td>
                    <td>{u.type}</td>
                    <td>
                      <img src={`http://localhost:3000/Images/${u.image}`} />
                    </td>
                    <td className="actions">
                      <button onClick={() => handleEdit(u)}>Edit</button>
                      <button onClick={() => handleDelete(u.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {!isAdmin && (
          <>
            <h3>Employees</h3>
            <table border="1">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>DOB</th>
                  <th>Type</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>{new Date(u.dob).toLocaleDateString("en-GB")}</td>

                    <td>{u.type}</td>
                    <td>
                      <img src={`http://localhost:3000/Images/${u.image}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {showProfile && (
          <Modal
            title="My Profile"
            onClose={() => {
              setShowProfile(false);
              setIsEditing(false);
            }}
          >
            {!isEditing ? (
              <>
                <p>
                  <strong>Name:</strong> {editData.name}
                </p>
                <p>
                  <strong>Email:</strong> {editData.email}
                </p>
                <p>
                  <strong>Phone:</strong> {editData.phone}
                </p>
                <p>
                  <strong>DOB:</strong>{" "}
                  {new Date(editData.dob).toLocaleDateString("en-GB")}
                </p>
                {user.role !== "admin" && (
                  <>
                    <p>
                      <strong>Type:</strong> {editData.type}
                    </p>
                    <button onClick={() => setIsEditing(true)}>Edit</button>
                  </>
                )}
              </>
            ) : (
              <div className="edit-profile-form">
                <input
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                />
                <br />
                <input
                  value={editData.phone}
                  onChange={(e) =>
                    setEditData({ ...editData, phone: e.target.value })
                  }
                />
                <br />
                <input
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                />
                <br />
                {editData.role !== "admin" && (
                  <>
                    <select
                      value={editData.type}
                      onChange={(e) =>
                        setEditData({ ...editData, type: e.target.value })
                      }
                    >
                      <option>Developer</option>
                      <option>Tester</option>
                    </select>
                    <br />
                  </>
                )}
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                />
                <br />
                <button onClick={handleUpdate}>Update</button>
              </div>
            )}
          </Modal>
        )}

        {showNotificationPopup && (
          <Modal
            title="Notifications"
            onClose={() => {
              setShowNotificationPopup(false);
              setEditMode(false);
              setNotifForm({ title: "", description: "", image: null });
            }}
          >
            <div className="notifications-modal-body">
              <button
                className="create-btn"
                onClick={() => {
                  setShowCreateForm(true);
                  setEditMode(false);
                  setNotifForm({ title: "", description: "", image: null });
                }}
              >
                Create Notification
              </button>

              <div className="notifications-list">
                {notifications.map((n) => (
                  <div key={n.id} className="notification-card">
                    <img
                      src={`http://localhost:3000/Images/${n.image}`}
                      alt="notif"
                    />
                    <div>
                      <h3>{n.title}</h3>
                      <p>{n.description}</p>
                      <button
                        onClick={() => {
                          setNotifForm({
                            title: n.title,
                            description: n.description,
                            image: null,
                          });
                          setEditId(n.id);
                          setEditMode(true);
                          setShowCreateForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteNotification(n.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {showCreateForm && (
              <NotificationModal
                editMode={editMode}
                notifForm={notifForm}
                setNotifForm={setNotifForm}
                handleCreateNotification={handleCreateNotification}
                setShowCreateForm={setShowCreateForm}
                setEditMode={setEditMode}
              />
            )}
          </Modal>
        )}

        {shownotifications && (
          <Modal
            title="Notifications"
            onClose={() => setShownotifications(false)}
          >
            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className="notification-card">
                    <img
                      src={`http://localhost:3000/Images/${notif.image}`}
                      alt="notification"
                      className="notification-image"
                    />
                    <div className="notification-details">
                      <h3>{notif.title}</h3>
                      <p>{notif.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No notifications available.</p>
              )}
            </div>
          </Modal>
        )}

        {showAddForm && (
          <Modal title="Add Employee" onClose={() => setShowAddForm(false)}>
            <form className="register-container" onSubmit={handleAddUser}>
              <input
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                name="email"
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                name="phone"
                placeholder="Phone number"
                type="number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <input
                name="password"
                placeholder="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select role type</option>
                <option value="Developer">Developer</option>
                <option value="Tester">Tester</option>
              </select>
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
              <div className="file-input">
                <label>Select Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit">Submit</button>
            </form>
          </Modal>
        )}
      </div>
    </>
  );
}

export default Dashboard;
