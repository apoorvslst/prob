import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();

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

    // Post Detail Modal State
    const [activeCommentPost, setActiveCommentPost] = useState(null);
    const [newComment, setNewComment] = useState("");

    // Helper: normalize legacy disk paths to proper web URLs
    const getPostImageUrl = (path) => {
        if (!path) return '';
        let url = path.replace(/\\/g, '/');
        if (url.startsWith('public/')) url = url.slice(6);
        if (!url.startsWith('/') && !url.startsWith('http')) url = '/' + url;
        return url;
    };

    // Get logged-in user for like checks
    const loggedInUser = JSON.parse(localStorage.getItem("user"));

    // ----------------------------------------------------
    // API PLACEHOLDERS (Write your Axios / Fetch logic here)
    // ----------------------------------------------------

    const fetchProfileData = async () => {
        try {
            console.log(`Fetching profile for: ${username}`);
            
            const res = await axios.get(`/api/users/profile/${username}`, {
                withCredentials: true
            });

            const loggedInUserStr = localStorage.getItem("user");
            const loggedInUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;
            const currentUserId = loggedInUser?._id;

            setProfileData({
                ...res.data,
                followersCount: res.data.followers?.length || 0,
                followingCount: res.data.following?.length || 0,
                postsCount: res.data.posts?.length || 0
            });

            if (currentUserId) {
                setIsOwnProfile(currentUserId === res.data._id);
                setIsFollowing(res.data.followers?.some(id => id.toString() === currentUserId));
            }

        } catch (error) {
            console.error("Failed to load profile", error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`/api/users/profile/update/me`, editForm, {
                withCredentials: true
            });

            setProfileData(prev => ({ ...prev, ...editForm }));
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

    const handleToggleFollow = async () => {
        try {
            const res = await axios.post(`/api/users/profile/follow/${profileData._id}`, {}, {
                withCredentials: true
            });
            
            setIsFollowing(!isFollowing);
            setProfileData(prev => ({
                ...prev,
                followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
            }));
        } catch (error) {
            console.error("Failed to toggle follow:", error.response?.data || error.message);
        }
    };

    const fetchUserPosts = async () => {
        try {
            if (!profileData?._id) return;
            const res = await axios.get(`/api/users/profile/posts/${profileData._id}`, {
                withCredentials: true
            });

            setPosts(res.data);
            setProfileData(prev => ({
                ...prev,
                postsCount: res.data.length
            }));
        } catch (error) {
            console.error("Failed to fetch posts", error);
        }
    };

    // Like a post from the profile modal
    const handleLike = async (postId) => {
        try {
            const res = await axios.post(`/api/post/like/${postId}`, {}, {
                withCredentials: true
            });
            // Update posts list
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return { ...post, likedBy: res.data.likedBy };
                }
                return post;
            }));
            // Update modal post if open
            if (activeCommentPost && activeCommentPost._id === postId) {
                setActiveCommentPost(prev => ({ ...prev, likedBy: res.data.likedBy }));
            }
        } catch (error) {
            console.error("Failed to like post:", error);
        }
    };

    // Add a comment from the profile modal
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const res = await axios.post(`/api/post/comment/${activeCommentPost._id}`, {
                text: newComment
            }, {
                withCredentials: true
            });
            const updatedPost = {
                ...activeCommentPost,
                comments: [...(activeCommentPost.comments || []), res.data]
            };
            setActiveCommentPost(updatedPost);
            setPosts(posts.map(p => p._id === activeCommentPost._id ? updatedPost : p));
            setNewComment("");
        } catch (error) {
            console.error("Failed to add comment:", error);
            alert("Could not post comment");
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
                                        <button 
                                            onClick={() => navigate('/message', { state: { selectedUser: profileData } })}
                                            className="px-5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg backdrop-blur-md transition-all"
                                        >
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
                            <div key={post._id} onClick={() => setActiveCommentPost(post)} className="relative aspect-square bg-[#1a1a1a] rounded overflow-hidden group cursor-pointer">
                                {post.media?.[0]?.mediaType === 'video' ? (
                                    <video src={getPostImageUrl(post.media?.[0]?.url)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <img src={getPostImageUrl(post.media?.[0]?.url || post.photo)} alt="Post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                )}
                                {post.media?.length > 1 && (
                                    <div className="absolute top-2 right-2 opacity-80 shadow-md p-1 rounded-md bg-black/50 backdrop-blur-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex justify-center items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-white font-bold flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-500">
                                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                        </svg>
                                        {post.likedBy?.length || 0}
                                    </span>
                                    <span className="text-white font-bold flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-white">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.92 1.786c-.082.1-.012.285.121.285a10.58 10.58 0 003.977-1.157c.38-.13.844-.098 1.21.127A10.12 10.12 0 0012 20.25Z" />
                                        </svg>
                                        {post.comments?.length || 0}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        savedPosts.map(post => (
                            <div key={post._id} className="relative aspect-square bg-[#1a1a1a] rounded overflow-hidden group cursor-pointer">
                                <img src={getPostImageUrl(post.photo)} alt="Saved Post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/50 flex justify-center items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-white font-bold flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-500">
                                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                        </svg>
                                        {post.likedBy?.length || 0}
                                    </span>
                                    <span className="text-white font-bold flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-white">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.92 1.786c-.082.1-.012.285.121.285a10.58 10.58 0 003.977-1.157c.38-.13.844-.098 1.21.127A10.12 10.12 0 0012 20.25Z" />
                                        </svg>
                                        {post.comments?.length || 0}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>

            {/* --- POST DETAIL MODAL --- */}
            {activeCommentPost && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveCommentPost(null)}>
                    <div className="bg-neutral-950 border border-neutral-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>

                        {/* Close Button */}
                        <button
                            onClick={() => setActiveCommentPost(null)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xl z-50 font-bold"
                        >
                            ✕
                        </button>

                        {/* Post Media */}
                        <div className="flex-1 bg-black flex items-center justify-center border-r border-neutral-800/50 max-h-[45vh] md:max-h-full overflow-hidden">
                            <div className="flex overflow-x-auto snap-x snap-mandatory w-full h-full scrollbar-hide">
                                {(() => {
                                    const mediaItems = activeCommentPost.media?.length > 0 
                                        ? activeCommentPost.media 
                                        : (activeCommentPost.photo || activeCommentPost.image ? [{ url: activeCommentPost.photo || activeCommentPost.image, mediaType: 'image' }] : []);
                                    
                                    return mediaItems.map((item, index) => (
                                        <div key={index} className="min-w-full snap-center flex items-center justify-center h-full">
                                            {item.mediaType === 'video' ? (
                                                <video src={getPostImageUrl(item.url)} controls className="w-full h-full object-contain max-h-[45vh] md:max-h-[80vh]" />
                                            ) : (
                                                <img src={getPostImageUrl(item.url)} alt={`Media ${index}`} className="w-full h-full object-contain max-h-[45vh] md:max-h-[80vh]" />
                                            )}
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        {/* Comments Side */}
                        <div className="w-full md:w-[400px] flex flex-col h-[45vh] md:h-auto max-h-[50vh] md:max-h-full">
                            {/* Header */}
                            <div className="flex items-center gap-2 p-4 border-b border-neutral-900">
                                <img
                                    src={activeCommentPost.owner?.profilePic || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                    alt="user"
                                    className="w-8 h-8 rounded-full object-cover border border-neutral-800"
                                />
                                <span className="font-semibold text-sm">{activeCommentPost.owner?.username}</span>
                            </div>

                            {/* Scrollable comments list */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {activeCommentPost.description && (
                                    <div className="flex gap-2 text-sm items-start">
                                        <img
                                            src={activeCommentPost.owner?.profilePic || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                            alt="user"
                                            className="w-6 h-6 rounded-full object-cover border border-neutral-800 mt-0.5"
                                        />
                                        <div>
                                            <span className="font-bold mr-2">{activeCommentPost.owner?.username}</span>
                                            <span className="text-neutral-300">{activeCommentPost.description}</span>
                                        </div>
                                    </div>
                                )}

                                {activeCommentPost.comments?.length === 0 ? (
                                    <div className="text-neutral-500 text-center py-8 text-sm">No comments yet. Be the first!</div>
                                ) : (
                                    activeCommentPost.comments?.map((comment) => (
                                        <div key={comment._id} className="flex gap-2 text-sm items-start">
                                            <img
                                                src={comment.user?.profilePic || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                                alt="user"
                                                className="w-6 h-6 rounded-full object-cover border border-neutral-800 mt-0.5"
                                            />
                                            <div>
                                                <span className="font-bold mr-2">{comment.user?.username}</span>
                                                <span className="text-neutral-300">{comment.text}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Actions: Like + Comment Count */}
                            <div className="flex gap-6 px-4 py-3 border-t border-neutral-900">
                                {/* Like Column */}
                                <div className="flex flex-col items-center gap-1">
                                    <button
                                        onClick={() => handleLike(activeCommentPost._id)}
                                        className="focus:outline-none transition-transform active:scale-90 cursor-pointer"
                                    >
                                        {activeCommentPost.likedBy?.includes(loggedInUser?._id) ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-500">
                                                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6 text-white hover:text-neutral-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                            </svg>
                                        )}
                                    </button>
                                    <span className="text-xs text-neutral-400 font-semibold">{activeCommentPost.likedBy?.length || 0}</span>
                                </div>
                                {/* Comment Column */}
                                <div className="flex flex-col items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6 text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.92 1.786c-.082.1-.012.285.121.285a10.58 10.58 0 003.977-1.157c.38-.13.844-.098 1.21.127A10.12 10.12 0 0012 20.25Z" />
                                    </svg>
                                    <span className="text-xs text-neutral-400 font-semibold">{activeCommentPost.comments?.length || 0}</span>
                                </div>
                            </div>

                            {/* Input box */}
                            <form onSubmit={handleAddComment} className="p-4 border-t border-neutral-900 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                                />
                                <button
                                    type="submit"
                                    className="text-blue-500 font-semibold text-sm hover:text-blue-400 disabled:opacity-50"
                                    disabled={!newComment.trim()}
                                >
                                    Post
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            )}

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
