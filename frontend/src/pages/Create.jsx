import React, { useState } from 'react';
import axios from 'axios';

const Create = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('other');
    const [postType, setPostType] = useState('post');
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    const categories = ["fun", "study", "travel", "fashion", "food", "fitness", "other"];

    // Handle image selection and preview
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        setPreviews(selectedFiles.map(file => URL.createObjectURL(file)));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(droppedFiles);
        setPreviews(droppedFiles.map(file => URL.createObjectURL(file)));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('postType', postType);
        
        // Append all selected files under the 'media' key
        files.forEach((file) => {
            formData.append('media', file);
        });

        try {
            const response = await axios.post('/api/post/upload', formData, {
                withCredentials: true,
            });
            alert("Post created successfully!");
            // Reset form
            setTitle('');
            setDescription('');
            setCategory('other');
            setPostType('post');
            setFiles([]);
            setPreviews([]);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload post.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-4 bg-black text-white">
                <div className="w-full max-w-[500px] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="border-b border-zinc-800 p-3 text-center font-semibold">
                        Create new post
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Image Upload Area */}
                        <div 
                            className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg aspect-square bg-zinc-900 relative hover:bg-zinc-800/50 transition-colors overflow-hidden"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            {previews.length > 0 ? (
                                <div className="flex overflow-x-auto snap-x gap-1 w-full h-full p-2 items-center">
                                    {previews.map((preview, index) => {
                                        const file = files[index];
                                        const isVideo = file?.type?.startsWith('video/');
                                        return (
                                            <div key={index} className="min-w-full snap-center rounded-lg overflow-hidden flex items-center justify-center bg-black h-full">
                                                {isVideo ? (
                                                    <video src={preview} controls className="w-full h-full object-contain" />
                                                ) : (
                                                    <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-contain" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
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
                                multiple
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                required
                            />
                        </div>

                        {/* Inputs */}
                        <div className="space-y-3">
                            {/* Post Type Toggle */}
                            <div className="flex rounded-lg overflow-hidden border border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setPostType('post')}
                                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                                        postType === 'post' ? 'bg-blue-500 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    Post
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPostType('reel')}
                                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                                        postType === 'reel' ? 'bg-blue-500 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    Reel
                                </button>
                            </div>

                            {/* Category Dropdown */}
                            <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 py-2 px-3 rounded-lg focus:outline-none focus:border-blue-500 text-sm text-white capitalize"
                            >
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            
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
    );
};

export default Create;
