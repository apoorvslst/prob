import React, { useState } from 'react';
import axios from 'axios';

const Create = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

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
        <div className="flex-1 flex justify-center items-center bg-black text-white p-4">
            <div className="w-full max-w-[500px] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="border-b border-zinc-800 p-3 text-center font-semibold">
                    Create new post
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Image Upload Area */}
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg aspect-square bg-zinc-900 relative">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-white rounded-full opacity-10 mb-4"></div>
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
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition"
                    >
                        Share Post
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Create;