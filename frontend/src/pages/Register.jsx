import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = ({ setAuthUser }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '', // Added fullName
        bio: '',     // Added bio
        link: ''     // Added link
    });
    const [profilePic, setProfilePic] = useState(null); // State for the profile picture file
    const [profilePicPreview, setProfilePicPreview] = useState(null); // State for image preview

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            for (const key in formData) {
                data.append(key, formData[key]);
            }
            if (profilePic) {
                data.append('profilePic', profilePic);
            }

            // Use the proxy path to ensure Same-Origin cookie handling
            const response = await axios.post('/api/users/register', data, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Important for file uploads
                },
                withCredentials: true
            });
            
            localStorage.setItem("user", JSON.stringify(response.data.user));
            setAuthUser(response.data.user);
            navigate("/");
        } catch (error) {
            console.error("Error registering user:", error.response?.data || error.message);
            alert("Registration Failed!");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProfilePic(file);
        if (file) {
            setProfilePicPreview(URL.createObjectURL(file));
        } else {
            setProfilePicPreview(null);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-black text-white">
            <form onSubmit={handleSubmit} className="bg-black border border-neutral-800 p-8 rounded shadow-md w-96">
                <h2 className="text-3xl mb-8 text-center font-serif italic">Instagram</h2>
                
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full p-2 mb-3 bg-neutral-900 border border-neutral-800 rounded text-sm focus:outline-none focus:border-neutral-500"
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    className="w-full p-2 mb-3 bg-neutral-900 border border-neutral-800 rounded text-sm focus:outline-none focus:border-neutral-500"
                    onChange={handleChange}
                    required
                />
                
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
                    className="w-full p-2 mb-4 bg-neutral-900 border border-neutral-800 rounded text-sm focus:outline-none focus:border-neutral-500"
                    onChange={handleChange}
                    required
                />

                <div className="mb-4">
                    <label htmlFor="profilePic" className="block text-xs font-medium text-neutral-400 mb-2">Profile Picture</label>
                    <input
                        type="file"
                        id="profilePic"
                        name="profilePic"
                        accept="image/*"
                        className="w-full text-xs text-neutral-400 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700"
                        onChange={handleFileChange}
                    />
                    {profilePicPreview && (
                        <img src={profilePicPreview} alt="Profile Preview" className="mt-2 w-24 h-24 object-cover rounded-full mx-auto" />
                    )}
                </div>

                <textarea
                    name="bio"
                    placeholder="Bio (optional)"
                    className="w-full p-2 mb-3 bg-neutral-900 border border-neutral-800 rounded text-sm resize-none h-20 focus:outline-none focus:border-neutral-500"
                    onChange={handleChange}
                ></textarea>

                <input
                    type="text"
                    name="link"
                    placeholder="Link (optional)"
                    className="w-full p-2 mb-6 bg-neutral-900 border border-neutral-800 rounded text-sm focus:outline-none focus:border-neutral-500"
                    onChange={handleChange}
                />
                
                <button type="submit" className="w-full bg-blue-500 text-white p-1.5 rounded font-semibold hover:bg-blue-600 transition text-sm">
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default Register;