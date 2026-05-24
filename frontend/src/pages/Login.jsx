import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setAuthUser }) => {
    const navigate = useNavigate();
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
            // Using the proxy path ensures cookies are stored correctly on localhost
            const response = await axios.post('/api/users/login', formData, {
                withCredentials: true
            });
            
            // Save user data to localStorage and update global state
            localStorage.setItem("user", JSON.stringify(response.data.user));
            setAuthUser(response.data.user);
            navigate("/");
        } catch (error) {
            console.error("Error logging in user:", error.response?.data || error.message);
            alert("Login Failed!");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-black text-white">
            <form onSubmit={handleSubmit} className="bg-black border border-neutral-800 p-8 rounded shadow-md w-96">
                <h2 className="text-3xl mb-8 text-center font-serif italic">Instagram</h2>
                
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full p-2 mb-3 bg-neutral-900 border border-neutral-800 rounded text-sm focus:outline-none focus:border-neutral-500"
                    onChange={handleChange}
                    required
                />
                
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full p-2 mb-6 bg-neutral-900 border border-neutral-800 rounded text-sm focus:outline-none focus:border-neutral-500"
                    onChange={handleChange}
                    required
                />
                
                <button type="submit" className="w-full bg-blue-500 text-white p-1.5 rounded font-semibold hover:bg-blue-600 transition text-sm">
                    Log In
                </button>
            </form>
        </div>
    );
};

export default Login;