import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = ({ authUser }) => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // If there is no authenticated user, redirect to login
    if (!authUser) {
      navigate('/login');
    }
  }, [authUser, navigate]);

  // Fetch real posts from your database feed route
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/post/feed', {
          withCredentials: true
        });
        setPosts(res.data);
      } catch (error) {
        console.error("Failed to fetch feed:", error);
      }
    };
    fetchFeed();
  }, []);

  // The Magic Like Function
  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`http://localhost:8000/api/post/like/${postId}`, {}, {
        withCredentials: true
      });
      
      // Instantly update the UI without refreshing the page!
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return { ...post, likedBy: res.data.likedBy };
        }
        return post;
      }));
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Search', path: '/search' },
    { name: 'Explore', path: '#' },
    { name: 'Reels', path: '#' },
    { name: 'Messages', path: '/message' },
    { name: 'Notifications', path: '#' },
    { name: 'Create', path: '/create' },
    { name: 'Profile', path: `/profile/${authUser?.username}` },
  ];

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* 1. SIDEBAR */}
      <div className="hidden md:flex flex-col w-[244px] border-r border-neutral-800 p-4 justify-between h-full shrink-0">
        <div>
          <div className="mb-8 mt-4 px-2">
            <h1 className="text-xl font-bold tracking-wider italic font-serif">Instagram</h1>
          </div>
          <nav className="space-y-2">
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.path} 
                className={`flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-900 transition-all duration-200 group ${item.name === 'Home' ? 'font-bold' : ''}`}
              >
                <span className="text-[15px]">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* 2. MAIN FEED */}
      <div className="flex-1 overflow-y-auto flex justify-center scrollbar-hide">
        <div className="w-full max-w-[630px] pt-8 pb-20 px-4 md:px-0">
          
          <div className="flex flex-col items-center mt-10">
            {posts.length === 0 ? (
                <div className="text-neutral-500 mt-20 text-lg">Follow some users to see their posts!</div>
            ) : (
                posts.map((post) => {
                  // Check if YOU have liked this post
                  const isLikedByMe = post.likedBy?.includes(authUser?._id);

                  return (
                    <div key={post._id} className="w-full max-w-[470px] border-b border-neutral-900 pb-8 mb-8">
                      
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2 cursor-pointer">
                          <img src={post.owner?.profilePic || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} alt="user" className="w-8 h-8 rounded-full object-cover border border-neutral-800" />
                          <span className="font-semibold text-sm hover:text-neutral-400">{post.owner?.username}</span>
                        </div>
                      </div>

                      {/* Post Image */}
                      <div className="rounded-sm border border-neutral-800 bg-neutral-900 flex items-center justify-center overflow-hidden">
                        <img src={post.photo || post.image} alt="Post content" className="w-full object-contain max-h-[585px]" />
                      </div>

                      {/* Post Actions (LIKE BUTTON) */}
                      <div className="flex justify-between items-center mt-4 mb-2 px-1">
                        <div className="flex gap-4">
                          <span 
                            onClick={() => handleLike(post._id)}
                            className={`text-2xl cursor-pointer transition-colors ${isLikedByMe ? 'text-red-500 hover:text-red-600' : 'text-white hover:text-neutral-400'}`}
                          >
                            {isLikedByMe ? '❤️' : '♡'}
                          </span>
                          <span className="text-2xl hover:text-neutral-400 cursor-pointer transition-colors">💬</span>
                        </div>
                      </div>
                      
                      {/* Like Count & Caption */}
                      <div className="px-1 text-sm font-bold mb-2">{post.likedBy?.length || 0} likes</div>
                      <div className="px-1 text-sm">
                        <span className="font-bold mr-2">{post.owner?.username}</span>
                        <span>{post.description}</span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;