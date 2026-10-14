const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Employee = require('./Model/Employee');

require('dotenv').config();

const app = express();


app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log('Connected to MongoDB');
}).catch((err)=>{
    console.error('Error connecting to MongoDB:', err);
});

// 1. CREATE Employee
app.post('/api/employees', async (req, res) => {
    try {
        const isExisting = await Employee.findOne({ email: req.body.email });
        if (isExisting) {
            return res.status(400).json({ message: 'Employee with this email already exists' });
        }

        const newEmployee = new Employee(req.body);
        const savedEmployee = await newEmployee.save();
        res.status(201).json(savedEmployee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. READ All Employees (with optional search)
app.get('/api/employees', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search && search.trim() !== '') {
            query = {
                $or: [
                    { name: { $regex: search.trim(), $options: 'i' } },
                    { email: { $regex: search.trim(), $options: 'i' } },
                    { department: { $regex: search.trim(), $options: 'i' } }
                ]
            };
        }
        const employees = await Employee.find(query);
        res.status(200).json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    } 
});

// 3. UPDATE Employee by ID
app.put('/api/employees/:id', async (req, res) => {
    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json({ message: 'Employee updated successfully', updatedEmployee });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. DELETE Employee by ID
app.delete('/api/employees/:id', async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json({ message: 'Employee deleted successfully', deletedEmployee });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
