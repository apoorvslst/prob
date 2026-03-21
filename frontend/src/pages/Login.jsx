import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Replace with your actual backend URL or just '/api/users/login' if using proxy
            const response = await axios.post('http://localhost:8000/api/users/login', formData);
            alert("Login Successful!");
            console.log(response.data);
        } catch (error) {
            console.error("Error logging in user:", error.response?.data || error.message);
            alert("Login Failed!");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl mb-6 text-center font-bold">Login</h2>
                
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full p-2 mb-4 border rounded"
                    onChange={handleChange}
                    required
                />
                
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full p-2 mb-6 border rounded"
                    onChange={handleChange}
                    required
                />
                
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">
                    Sign In
                </button>
            </form>
        </div>
    );
};

export default Login;