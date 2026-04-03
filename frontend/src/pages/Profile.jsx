import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
    const { username } = useParams();

    // ----------------------------------------------------
    // STATE MANAGEMENT
    // ----------------------------------------------------
    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);

    const [activeTab, setActiveTab] = useState('POSTS'); // 'POSTS' or 'SAVED'
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ fullName: '', bio: '', link: '' });

    // ----------------------------------------------------
    // API PLACEHOLDERS (Write your Axios / Fetch logic here)
    // ----------------------------------------------------

    const fetchProfileData = async () => {
        try {
            console.log(`Fetching profile for: ${username}`);
            
            // FLAG-A SOLVED: Fetch from actual backend endpoint
            // Note: Update URL standard 'http://localhost:5000' to match your setup exactly
            const res = await axios.get(`http://localhost:5000/api/profile/${username}`, {
                withCredentials: true // Required to automatically send your HttpOnly JWT cookies!
            });

            // The backend returns the User object. Map it securely to what UI expects:
            setProfileData({
                ...res.data, // Merges username, fullName, profilePic, bio, link
                followersCount: res.data.followers?.length || 0,
                followingCount: res.data.following?.length || 0,
                postsCount: res.data.posts?.length || 0 // (Will be 0 until you aggregate posts from the DB)
            });

            // TODO: To make this dynamic, compare incoming user ID against your Global Auth State (Context/Redux)
            // setIsOwnProfile(currentUser._id === res.data._id);
            setIsOwnProfile(true); // Keeping true so you can use the 'Edit' testing button!

        } catch (error) {
            console.error("Failed to load profile", error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            // TODO: axios.put('/api/profile/update', editForm)
            setProfileData(prev => ({ ...prev, ...editForm }));
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

    const handleToggleFollow = async () => {
        try {
            // TODO: axios.post(`/api/profile/follow/${profileData._id}`)
            setIsFollowing(!isFollowing);
            setProfileData(prev => ({
                ...prev,
                followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
            }));
        } catch (error) {
            console.error("Failed to toggle follow", error);
        }
    };

    const fetchUserPosts = async () => {
        try {
            // Dummy Images
            setPosts([
                { _id: '1', photo: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=800&q=80', likes: 120, comments: 15 },
                { _id: '2', photo: 'https://images.unsplash.com/photo-1682687982501-1e58f8147610?auto=format&fit=crop&w=800&q=80', likes: 300, comments: 24 },
                { _id: '3', photo: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80', likes: 45, comments: 2 }
            ]);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        }
    };

    const fetchSavedPosts = async () => {
        try {
            setSavedPosts([
                { _id: '4', photo: 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?auto=format&fit=crop&w=800&q=80', likes: 12, comments: 1 }
            ]);
        } catch (error) {
            console.error("Failed to fetch saved posts", error);
        }
    };

    // ----------------------------------------------------
    // LIFECYCLE
    // ----------------------------------------------------
    useEffect(() => {
        fetchProfileData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username]);

    useEffect(() => {
        if (profileData) {
            if (activeTab === 'POSTS') fetchUserPosts();
            if (activeTab === 'SAVED') fetchSavedPosts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, profileData]);

    const openEditModal = () => {
        setEditForm({
            fullName: profileData?.fullName || '',
            bio: profileData?.bio || '',
            link: profileData?.link || ''
        });
        setIsEditModalOpen(true);
    };

    if (!profileData) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-10">
            <div className="max-w-4xl mx-auto px-4 pt-8 md:pt-12">

                {/* --- HEADER SECTION --- */}
                <header className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mb-12">

                    {/* AVATAR */}
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:scale-105 transition-transform duration-300">
                            <img
                                src={profileData.profilePic || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                alt={`${profileData.username}'s avatar`}
                                className="w-full h-full object-cover rounded-full border-4 border-[#0a0a0a]"
                            />
                        </div>
                    </div>

                    {/* USER INFO */}
                    <div className="flex-grow flex flex-col w-full md:w-auto text-center md:text-left">

                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
                            <h2 className="text-xl md:text-2xl font-normal tracking-wide">{profileData.username}</h2>

                            {/* ACTION BUTTONS */}
                            <div className="flex gap-2 justify-center md:justify-start">
                                {isOwnProfile ? (
                                    <>
                                        <button onClick={openEditModal} className="px-5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg backdrop-blur-md transition-all">
                                            Edit Profile
                                        </button>
                                        <button className="px-5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg backdrop-blur-md transition-all">
                                            View Archive
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleToggleFollow} className={`px-6 py-1.5 text-sm font-semibold rounded-lg transition-all shadow-lg ${isFollowing ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30'}`}>
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                        <button className="px-5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg backdrop-blur-md transition-all">
                                            Message
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* STATS */}
                        <ul className="flex justify-center md:justify-start gap-8 mb-5">
                            <li className="text-gray-300"><span className="text-white font-semibold">{profileData.postsCount}</span> posts</li>
                            <li className="text-gray-300"><span className="text-white font-semibold">{profileData.followersCount}</span> followers</li>
                            <li className="text-gray-300"><span className="text-white font-semibold">{profileData.followingCount}</span> following</li>
                        </ul>

                        {/* BIO */}
                        <div className="text-sm md:text-base leading-relaxed">
                            <div className="font-semibold text-white mb-1">{profileData.fullName}</div>
                            <div className="text-gray-300 whitespace-pre-line mb-1">{profileData.bio}</div>
                            {profileData.link && (
                                <a href={profileData.link} target="_blank" rel="noreferrer" className="text-blue-400 font-medium hover:text-blue-300 hover:underline transition-colors">
                                    {profileData.link.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                        </div>
                    </div>
                </header>

                {/* --- TABS --- */}
                <div className="flex justify-center border-t border-white/10 gap-12 md:gap-20">
                    <button
                        onClick={() => setActiveTab('POSTS')}
                        className={`text-xs md:text-sm font-semibold tracking-widest uppercase py-4 flex items-center gap-2 border-t md:border-t-2 transition-colors ${activeTab === 'POSTS' ? 'text-white border-white' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                    >
                        Posts
                    </button>
                    {isOwnProfile && (
                        <button
                            onClick={() => setActiveTab('SAVED')}
                            className={`text-xs md:text-sm font-semibold tracking-widest uppercase py-4 flex items-center gap-2 border-t md:border-t-2 transition-colors ${activeTab === 'SAVED' ? 'text-white border-white' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                        >
                            Saved
                        </button>
                    )}
                </div>

                {/* --- PHOTO GRID --- */}
                <div className="grid grid-cols-3 gap-1 md:gap-4 mt-2">
                    {activeTab === 'POSTS' ? (
                        posts.map(post => (
                            <div key={post._id} className="relative aspect-square bg-[#1a1a1a] rounded overflow-hidden group cursor-pointer">
                                <img src={post.photo} alt="Post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/50 flex justify-center items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-white font-bold flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        ❤️ {post.likes}
                                    </span>
                                    <span className="text-white font-bold flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                        💬 {post.comments}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        savedPosts.map(post => (
                            <div key={post._id} className="relative aspect-square bg-[#1a1a1a] rounded overflow-hidden group cursor-pointer">
                                <img src={post.photo} alt="Saved Post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/50 flex justify-center items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-white font-bold flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        ❤️ {post.likes}
                                    </span>
                                    <span className="text-white font-bold flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                        💬 {post.comments}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>

            {/* --- EDIT PROFILE MODAL --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setIsEditModalOpen(false)}>
                    <div className="bg-[#1c1c1c] border border-white/10 shadow-2xl rounded-2xl p-6 md:p-8 w-full max-w-sm relative" onClick={e => e.stopPropagation()}>

                        <h3 className="text-xl font-semibold mb-6 tracking-wide text-center">Edit Profile</h3>

                        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.fullName}
                                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                                    className="bg-[#2a2a2a] border border-transparent focus:border-blue-500 text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold ml-1">Bio</label>
                                <textarea
                                    value={editForm.bio}
                                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                    maxLength={150}
                                    className="bg-[#2a2a2a] border border-transparent focus:border-blue-500 text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors resize-none min-h-[100px]"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold ml-1">Link</label>
                                <input
                                    type="text"
                                    value={editForm.link}
                                    onChange={e => setEditForm({ ...editForm, link: e.target.value })}
                                    className="bg-[#2a2a2a] border border-transparent focus:border-blue-500 text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors"
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-transparent border border-white/20 hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
