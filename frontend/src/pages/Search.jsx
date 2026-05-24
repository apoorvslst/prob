import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const Search = ({ authUser }) => {
    // ----------------------------------------------------
    // STATE MANAGEMENT
    // ----------------------------------------------------
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();


    // ----------------------------------------------------
    // API PLACEHOLDERS (Practice Area!)
    // ----------------------------------------------------

    const handleSearch = async (e) => {
        e.preventDefault();
        // Search logic is now handled by the dynamic useEffect below
    };

    const handleFollow = async (userId) => {
        try {
            console.log(`Following user: ${userId}`);

            // =========================================================
            // TODO 2: Follow User using Backend
            // =========================================================
            // Consistency is key: keep using the proxy path
            const res = await axios.post(`/api/users/profile/follow/${userId}`, {}, {
                withCredentials: true
            });
            
            // Update local state so the button flips to 'Following' or 'Follow' immediately
            setResults(prevResults => prevResults.map(user => {
                if (user._id === userId && authUser) {
                    const isNowFollowing = res.data.message === "Followed";
                    const updatedFollowers = isNowFollowing 
                        ? [...(user.followers || []), authUser._id]
                        : (user.followers || []).filter(id => id !== authUser._id);
                    return { ...user, followers: updatedFollowers };
                }
                return user;
            }));

        } catch (error) {
            console.error("Failed to follow", error);
        }
    };

    // Dynamic Search with Debouncing: Triggers 400ms after you stop typing
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (!searchQuery.trim()) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = await axios.get(`/api/users/search?query=${searchQuery}`, {
                    withCredentials: true,
                });
                setResults(res.data);
            } catch (error) {
                console.error("Failed to search users", error);
            } finally {
                setIsLoading(false);
            }
        }, 400); 

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-10">
            <div className="max-w-3xl mx-auto px-4 pt-12 md:pt-16">

                {/* --- HEADER & SEARCH BAR --- */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-wide mb-3">Explore</h1>
                    <p className="text-gray-400 text-sm md:text-base">Find people to connect with.</p>
                </div>

                <form onSubmit={handleSearch} className="relative mb-12">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for username or full name..."
                        className="w-full bg-[#1c1c1c] border border-white/10 hover:border-white/20 focus:border-blue-500 transition-colors rounded-2xl py-4 pl-5 pr-14 text-white text-sm outline-none shadow-lg shadow-black/50"
                    />
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </form>

                {/* --- RESULTS GRID --- */}
                <div className="flex flex-col gap-4">
                    {isLoading ? (
                        <div className="text-center text-gray-500 py-10 animate-pulse">Searching...</div>
                    ) : results.length > 0 ? (
                        results.map((user) => (
                            <div onClick={() => navigate(`/profile/${user.username}`)} key={user._id} className="bg-[#141414] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors cursor-pointer group">

                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-gray-700 to-gray-500 overflow-hidden group-hover:from-blue-500 group-hover:to-fuchsia-600 transition-all duration-300">
                                        <img
                                            src={user.profilePic || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                            alt={user.username}
                                            className="w-full h-full object-cover rounded-full border-2 border-[#141414]"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium text-base tracking-wide">{user.username}</span>
                                        <span className="text-gray-400 text-sm">{user.fullName || "Member"}</span>
                                    </div>
                                </div>

                                {authUser && user._id !== authUser._id && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevents the block click
                                        handleFollow(user._id);
                                    }}
                                    className={`px-5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all border border-white/5 ${
                                        user.followers?.some(id => id.toString() === authUser._id) 
                                        ? 'bg-white/10 hover:bg-white/20 text-white' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                                    }`}
                                >
                                    {user.followers?.some(id => id.toString() === authUser._id) ? 'Following' : 'Follow'}
                                </button>
                                )}

                            </div>
                        ))
                    ) : (
                        searchQuery && !isLoading && (
                            <div className="text-center text-gray-500 py-10">
                                No users found for "{searchQuery}"
                            </div>
                        )
                    )}
                </div>

            </div>
        </div>
    );
};

export default Search;
