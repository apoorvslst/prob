import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  // Dummy data to make the UI render like the screenshot
  const stories = [
    { id: 1, user: "propah_m...", img: "https://i.pravatar.cc/150?img=11" },
    { id: 2, user: "dhairya77.7", img: "https://i.pravatar.cc/150?img=12" },
    { id: 3, user: "prashant_k...", img: "https://i.pravatar.cc/150?img=13" },
    { id: 4, user: "imaayankh...", img: "https://i.pravatar.cc/150?img=14" },
    { id: 5, user: "raghvend...", img: "https://i.pravatar.cc/150?img=15" },
    { id: 6, user: "krishna_373", img: "https://i.pravatar.cc/150?img=16" },
    { id: 7, user: "princekr.iii...", img: "https://i.pravatar.cc/150?img=17" },
  ];

  const posts = [
    {
      id: 1,
      user: "cristiano",
      verified: true,
      time: "1w",
      userImg: "https://i.pravatar.cc/150?img=33",
      postImg: "https://images.unsplash.com/photo-1518605368461-1e1e38ce8ba4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", 
    }
  ];

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Search', path: '#' },
    { name: 'Explore', path: '#' },
    { name: 'Reels', path: '#' },
    { name: 'Messages', path: '#' },
    { name: 'Notifications', path: '#' },
    { name: 'Create', path: '/create' },
    { name: 'Profile', path: '#' },
  ];

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
                className={`flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-900 transition-all duration-200 group ${item.name === 'Home' ? 'font-bold' : ''}`}
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

      {/* 2. MAIN FEED (Center) */}
      <div className="flex-1 overflow-y-auto flex justify-center scrollbar-hide">
        <div className="w-full max-w-[630px] pt-8 pb-20 px-4 md:px-0">
          
          {/* Stories Section */}
          <div className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide border-b border-neutral-900">
            {stories.map((story) => (
              <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer shrink-0">
                <div className="w-[66px] h-[66px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 hover:scale-105 transition-transform">
                  <div className="bg-black p-[2px] rounded-full h-full w-full">
                    <img src={story.img} alt={story.user} className="rounded-full w-full h-full object-cover border border-black" />
                  </div>
                </div>
                <span className="text-[11px] text-neutral-400 truncate w-16 text-center">{story.user}</span>
              </div>
            ))}
          </div>

          {/* Posts Section */}
          <div className="flex flex-col items-center">
            {posts.map((post) => (
              <div key={post.id} className="w-full max-w-[470px] border-b border-neutral-900 pb-8 mb-8">
                
                {/* Post Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <img src={post.userImg} alt="user" className="w-8 h-8 rounded-full object-cover border border-neutral-800" />
                    <span className="font-semibold text-sm hover:text-neutral-400 cursor-pointer">{post.user}</span>
                    {post.verified && <span className="text-blue-500 text-[10px]">✔️</span>}
                    <span className="text-neutral-500 text-xs">• {post.time}</span>
                  </div>
                  <button className="text-neutral-300 hover:text-white font-bold tracking-widest text-lg">...</button>
                </div>

                {/* Post Image */}
                <div className="rounded-sm border border-neutral-800 bg-neutral-900 flex items-center justify-center overflow-hidden">
                  <img src={post.postImg} alt="Post content" className="w-full object-contain max-h-[585px]" />
                </div>

                {/* Post Actions */}
                <div className="flex justify-between items-center mt-4 mb-2 px-1">
                  <div className="flex gap-4">
                    <span className="text-2xl hover:text-neutral-400 cursor-pointer transition-colors">♡</span>
                    <span className="text-2xl hover:text-neutral-400 cursor-pointer transition-colors">💬</span>
                    <span className="text-2xl hover:text-neutral-400 cursor-pointer transition-colors">✈️</span>
                  </div>
                  <span className="text-2xl hover:text-neutral-400 cursor-pointer transition-colors">🔖</span>
                </div>
                
                {/* Like Count */}
                <div className="px-1 text-sm font-bold mb-2">1,234 likes</div>
                
                {/* Caption */}
                <div className="px-1 text-sm">
                  <span className="font-bold mr-2">{post.user}</span>
                  <span>Feeling motivated today! ⚽✨ #football #lifestyle</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Messages Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 hidden lg:flex items-center gap-3 bg-neutral-900 rounded-full px-5 py-3 cursor-pointer shadow-2xl hover:bg-neutral-800 border border-neutral-800 transition-all active:scale-95">
        <span className="text-xl">💬</span>
        <span className="font-semibold text-sm">Messages</span>
        <div className="bg-red-500 w-2 h-2 rounded-full absolute -top-1 -right-1 border-2 border-black"></div>
      </div>

    </div>
  );
};

export default Home;
