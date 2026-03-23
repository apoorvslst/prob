import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Create = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Search', path: '#'},
        { name: 'Explore', path: '#' },
        { name: 'Reels', path: '#' },
        { name: 'Messages', path: '#' },
        { name: 'Notifications', path: '#', },
        { name: 'Create', path: '/create'},
        { name: 'Profile', path: '#'},
    ];

    // Handle image selection and preview
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('photo', file);

        try {
            const response = await axios.post('/api/post/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Post created successfully!");
            // Reset form
            setTitle('');
            setDescription('');
            setFile(null);
            setPreview(null);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload post.");
        }
    };

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            
            {/* 1. SIDEBAR (Left) */}
            <div className="hidden md:flex flex-col w-[244px] border-r border-neutral-800 p-4 justify-between h-full shrink-0">
                <div>
                    {/* Logo */}
                    <div className="mb-8 mt-4 px-2">
                        <h1 className="text-xl font-bold tracking-wider italic font-serif">Instagram</h1>
                    </div>
                    
                    {/* Nav Links */}
                    <nav className="space-y-2">
                        {navItems.map((item, index) => (
                            <Link 
                                key={index} 
                                to={item.path} 
                                className={`flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-900 transition-all duration-200 group ${item.name === 'Create' ? 'font-bold' : ''}`}
                            >
                                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                <span className="text-[15px]">{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Bottom Nav */}
                <div className="space-y-2">
                    <Link to="#" className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-900 transition-colors">
                        <span className="text-xl">≡</span>
                        <span className="text-[15px]">More</span>
                    </Link>
                </div>
            </div>

            {/* 2. MAIN CONTENT (Center) */}
            <div className="flex-1 flex justify-center items-center p-4 overflow-y-auto bg-black">
                <div className="w-full max-w-[500px] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="border-b border-zinc-800 p-3 text-center font-semibold">
                        Create new post
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Image Upload Area */}
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg aspect-square bg-zinc-900 relative hover:bg-zinc-800/50 transition-colors">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-white rounded-full opacity-10 mb-4 flex items-center justify-center">
                                        <span className="text-2xl">🖼️</span>
                                    </div>
                                    <p className="text-sm text-zinc-400">Drag photos and videos here</p>
                                </div>
                            )}
                            <input 
                                type="file" 
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                required
                            />
                        </div>

                        {/* Inputs */}
                        <div className="space-y-3">
                            <input 
                                type="text" 
                                placeholder="Add a title..." 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent border-b border-zinc-800 py-2 focus:outline-none focus:border-blue-500 text-sm"
                                required
                            />
                            <textarea 
                                placeholder="Write a caption..." 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-transparent border-b border-zinc-800 py-2 focus:outline-none focus:border-blue-500 text-sm h-24 resize-none"
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-all active:scale-95"
                        >
                            Share Post
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Create;
