import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
// import { useAuth } from './context/useAuth';
// import Notifications from './components/Notifications';
import Profile from './components/Profile';
import AddEmployee from './components/AddEmployee';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EditProfile from './components/EditProfile';
import "./App.css"
import Managenotifications from './components/Managenotifications';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import CompanyBanners from './components/CompanyBanners';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

<DndProvider backend={HTML5Backend}>
  <CompanyBanners />
</DndProvider>

function App() {
  const { user} = useContext(AuthContext);

  return (
    <Router>
      <div className="app-wrapper"> 
        {user && <Navbar />}
        <div className="main-content"> 
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
            <Route path="/edit-profile" element={user ? <EditProfile /> : <Navigate to="/" />} />
            <Route path="/add-employee" element={user && user.role === 'admin' ? <AddEmployee /> : <Navigate to="/" />} />
            <Route path="/manage-notifications" element={user ? <Managenotifications /> : <Navigate to="/" />} />
                      <Route path="/image-uploads" element={user ? <CompanyBanners /> : <Navigate to="/" />} /> 
</Routes>
        </div>
{user && <Footer />}
      </div>
    </Router>
  );
}

export default App;
