import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchUsers = async (isAdmin, token, logout, setAdmins, setEmployees) => {
  const endpoint = isAdmin ? "" : "employees";
  try {
    const res = await axios.get(`${API_BASE_URL}/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = res.data;
    if (isAdmin) {
      setAdmins(data.filter((u) => u.role === "admin"));
      setEmployees(data.filter((u) => u.role === "employee"));
    } else {
      setEmployees(data);
    }
  } catch (err) {
    console.error("Error fetching users:", err);
    if (err.response?.status === 401) {
      alert("Session expired. Please login again.");
      logout();
    }
  }
};
export default fetchUsers;
