import { useState, useEffect } from "react";
import axio from 'axios';
import './App.css';
import axios from "axios";

const API_URL = 'http://localhost:5000/api/employees';

function App() {
    const { emplyee, setEmplooyee } = useState([]);
    const { formDta, setFormData } = useState({ name: '', email: '', department: ' ', salary: '' });
    const [editingId, setEditingid] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchEmployee = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}?search=${search}`);
            setEmplooyee(res.data);
            setMessage({ type: 'success', text: 'Employees fetched successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const delay = setTimeout(() => fetchEmployee(), 300);
        return () => clearTimeout(delay);

    }, [search]);

    const handleinput = (e) => setFormData({ ...formDta, [e.target.name]: e.target.value });
    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, formDta);
                showMessage('success', 'Employee updated successfully');
            } else {
                await axios.post(API_URL, formDta)
            }

            setFormData = ({ name: '', email: '', department: '', salary: '' });
            setEditingId(null);
            fetchEmployee();
        } catch (err) {
            err.message = err.response?.data?.message || err.message;
            showMessage('error', error.message || "An error ");
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure??'));
        return;

        try {
            await axios.delete(`${API_URL}/${id}`);
            showMessage('success', 'Employee deleted successfully');
            fetchEmployee();
        } catch (err) {
            err.message = err.response?.data?.message || err.message;
            showMessage('error', err.message || "An error ")
        }
    }
    const handleEdit = (emp) => {
        setEditingId(emp._id);
        setFormData({ name: emp.name, email: emp.email, department: emp.department, salary: emp.salary });
    };

    return (
        <div class="container">
            <h2> employee management</h2>
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="full name" value={formDta.name} onChange={handleinput} required />
                <input type="email" name="email" placeholder="email address" value={formDta.email} onChange={handleinput} required />
                <input type="text" name="department" placeholder="department" value={formDta.department} onChange={handleinput} required />
                <input type="number" name="salary" placeholder="salary" value={formDta.salary} onChange={handleinput} required />
                <div className="form-actions">
                    <button type="submit">{editingId ? "UpdateEmployee" : "AddEmployee"}</button>
                    {editingId &&}
                </div>
            </form>
        </div>
    )

}