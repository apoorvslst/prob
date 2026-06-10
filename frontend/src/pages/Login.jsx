import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setAuthUser }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post('/api/users/login', formData, {
                withCredentials: true
            });
            
            // Save user data to localStorage and update global state
            localStorage.setItem("user", JSON.stringify(response.data.user));
            setAuthUser(response.data.user);
            navigate("/");
        } catch (error) {
            console.error("Error logging in user:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white">
            <div className="bg-black border border-neutral-800 p-8 rounded shadow-md w-80 md:w-96 mb-4">
                <h2 className="text-4xl mb-10 text-center font-serif italic tracking-wider">Instagram</h2>
                
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="w-full p-2.5 mb-3 bg-neutral-900 border border-neutral-800 rounded text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                        onChange={handleChange}
                        required
                    />
                    
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="w-full p-2.5 mb-4 bg-neutral-900 border border-neutral-800 rounded text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                        onChange={handleChange}
                        required
                    />
                    
                    {error && <p className="text-red-500 text-xs mb-4 text-center">{error}</p>}
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-blue-500 text-white p-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-9"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            "Log In"
                        )}
                    </button>
                </form>
            </div>
            
            <div className="bg-black border border-neutral-800 p-5 rounded shadow-md w-80 md:w-96 text-center text-sm">
                <p>
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-500 font-semibold hover:text-blue-400 transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;