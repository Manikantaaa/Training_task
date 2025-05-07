import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import "../styles/Dashboard.css";
function Dashboard() {
  const { user,setUser, logout, token } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editData, setEditData] = useState({});
  const [image, setImage] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    const endpoint = isAdmin ? 'api' : 'api/employees';

    axios.get(`http://localhost:3000/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const data = res.data;
      if (isAdmin) {
        setAdmins(data.filter(u => u.role === 'admin'));
        setEmployees(data.filter(u => u.role !== 'admin'));
      } else {
        setEmployees(data);
      }
    }).catch(err => {
      console.error('Error fetching users:', err);
      if (err.response && err.response.status === 401) {
        alert('Session expired. Please login again.');
        logout(); 
      }
        });
  }, [isAdmin, token,employees,user,logout]);

  const handleDelete = (id) => {
    axios.delete(`http://localhost:3000/api/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setEmployees(prev => prev.filter(u => u.id !== id));
      setAdmins(prev => prev.filter(u => u.id !== id));
    });
  };

  const handleEdit = (u) => {
    setEditData({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      type: u.type || '',
      role:u.role
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
      type: user.type || '',
      dob:user.dob
    });
    setShowProfile(true);
    setIsEditing(false); 
  };

  const handleUpdate = async () => {
    try {
      const data = new FormData();
      data.append('name', editData.name);
      data.append('email', editData.email);
      data.append('phone', editData.phone);
      data.append('type', editData.type);
      if (image) data.append('image', image);

      await axios.put(`http://localhost:3000/api/${editData.id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (editData.id === user.id) {
        const updatedUser = { ...user, ...editData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      alert('Profile updated');
      setShowProfile(false);
      setIsEditing(false);

     
      
      if (isAdmin) {
        setAdmins(prev => prev.map(u => u.id === editData.id ? { ...u, ...editData } : u));
        setEmployees(prev => prev.map(u => u.id === editData.id ? { ...u, ...editData } : u));
      } else {
        setEmployees(prev => prev.map(u => u.id === editData.id ? { ...u, ...editData } : u));
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile");
    }
  };

  return (
<div className="dashboard-container">
<div className="dashboard-header">
        <h2>Welcome, {user.name} ({user.role})</h2>
        <div className="dashboard-buttons">
      <button onClick={logout}>Logout</button>
      <button onClick={handleMyProfile}>My Profile</button>
    </div>
      {isAdmin && (
        <>
          <h3>Admin List</h3>
          <table border="1">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>DOB</th><th>Role</th><th>Image</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {admins.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{new Date(u.dob).toLocaleDateString('en-GB')}</td>
                  <td>{u.role}</td>
                  <td><img src={`http://localhost:3000/Images/${u.image}`}  /></td>
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
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>DOB</th><th>Type</th><th>Image</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {employees.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{new Date(u.dob).toLocaleDateString('en-GB')}</td>
                  <td>{u.type}</td>
                  <td><img src={`http://localhost:3000/Images/${u.image}`} /></td>
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
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>DOB</th><th>Type</th><th>Image</th></tr>
            </thead>
            <tbody>
              {employees.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{new Date(u.dob).toLocaleDateString('en-GB')}</td>

                  <td>{u.type}</td>
                  <td><img src={`http://localhost:3000/Images/${u.image}`}  /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
<div className='profile-section' style={{ display: showProfile ? 'block' : 'none' }}> 
                  <h3> Profile</h3>
          {!isEditing ? (
            <>
              <p><strong>Name:</strong> {editData.name}</p>
              <p><strong>Email:</strong> {editData.email}</p>
              <p><strong>Phone:</strong> {editData.phone}</p>
              <p><strong>DOB:</strong> {new Date(editData.dob).toLocaleDateString('en-GB')}</p>
              {user.role !== 'admin' && (
                <>
                <p><strong>Type:</strong> {editData.type}</p>
              <button onClick={() => setIsEditing(true)}>Edit</button>
              </>)}
            </>
          ) : (
            <>
              <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} /><br />
              <input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} /><br />
              <input value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} /><br />
              {editData.role !== 'admin' && (
                <>
                  <select value={editData.type} onChange={e => setEditData({ ...editData, type: e.target.value })}>
                    <option>Developer</option>
                    <option>Tester</option>
                  </select><br />
                </>
              )}
              <input type="file" onChange={e => setImage(e.target.files[0])} /><br />
              <button onClick={handleUpdate}>Update</button>
            </>
          )}
        
      </div>
    </div>
    </div>
  );
}

export default Dashboard;
