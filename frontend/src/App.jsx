import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api/employees';

function App() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', department: '', salary: '' });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch Employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?search=${search}`);
      setEmployees(res.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch employees');
    }
    setLoading(false);
  };

  useEffect(() => {
    // Debounce search slightly
    const delay = setTimeout(() => fetchEmployees(), 300);
    return () => clearTimeout(delay);
  }, [search]);

  // Handle Form Inputs
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Submit Handler (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        showMessage('success', 'Employee updated successfully');
      } else {
        await axios.post(API_URL, formData);
        showMessage('success', 'Employee added successfully');
      }
      setFormData({ name: '', email: '', department: '', salary: '' });
      setEditingId(null);
      fetchEmployees();
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Action failed';
      showMessage('error', errMsg);
    }
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      showMessage('success', 'Employee deleted');
      fetchEmployees();
    } catch (error) {
      showMessage('error', 'Failed to delete employee');
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp._id);
    setFormData({ name: emp.name, email: emp.email, department: emp.department, salary: emp.salary });
  };

  return (
    <div className="container">
      <h2>Employee Management</h2>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
        <input name="department" placeholder="Department" value={formData.department} onChange={handleChange} required />
        <input name="salary" type="number" placeholder="Salary ($)" value={formData.salary} onChange={handleChange} required />
        <div className="form-actions">
          <button type="submit">{editingId ? 'Update Employee' : 'Add Employee'}</button>
          {editingId && (
            <button
              type="button"
              className="cancel-btn"
              onClick={() => { setEditingId(null); setFormData({ name: '', email: '', department: '', salary: '' }); }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <input
        className="search-bar"
        placeholder="Search by name, email, or department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? <p className="no-data">Loading employees...</p> : (
        <div>
          {employees.map(emp => (
            <div key={emp._id} className="employee-card">
              <div>
                <div className="emp-name">{emp.name}</div>
                <div className="emp-email">{emp.email}</div>
                <div className="emp-meta">
                  <span className="emp-badge">{emp.department}</span>
                  <span className="emp-salary">${Number(emp.salary).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <button className="edit-btn" onClick={() => handleEdit(emp)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(emp._id)}>Delete</button>
              </div>
            </div>
          ))}
          {employees.length === 0 && <p className="no-data">No employees found.</p>}
        </div>
      )}
    </div>
  );
}

export default App;