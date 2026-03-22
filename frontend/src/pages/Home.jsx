import React from 'react';

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
      postImg: "https://images.unsplash.com/photo-1518605368461-1e1e38ce8ba4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", // Placeholder sports image
    }
  ];

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* 1. SIDEBAR (Left) */}
      <div className="hidden md:flex flex-col w-[244px] border-r border-neutral-800 p-4 justify-between h-full shrink-0">
        <div>
          {/* Logo */}
          <div className="mb-8 mt-4 px-2">
            <h1 className="text-xl font-bold tracking-wider italic">Instagram</h1>
          </div>
          
          {/* Nav Links */}
          <nav className="space-y-2">
            {['Home', 'Search', 'Explore', 'Reels', 'Messages', 'Notifications', 'Create', 'Profile'].map((item, index) => (
              <a key={index} href="#" className={`flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-900 transition-colors ${item === 'Home' ? 'font-bold' : ''}`}>
                <div className="w-6 h-6 bg-white rounded-full opacity-20"></div> {/* Placeholder for Icons */}
                <span className="text-[15px]">{item}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom Nav */}
        <div className="space-y-2">
          <a href="#" className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-900 transition-colors">
            <div className="w-6 h-6 bg-white rounded-full opacity-20"></div>
            <span className="text-[15px]">More</span>
          </a>
        </div>
      </div>

      {/* 2. MAIN FEED (Center) */}
      <div className="flex-1 overflow-y-auto flex justify-center">
        <div className="w-full max-w-[630px] pt-8 pb-20 px-4 md:px-0">
          
          {/* Stories Section */}
          <div className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {stories.map((story) => (
              <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer shrink-0">
                {/* Instagram Gradient Ring */}
                <div className="w-[66px] h-[66px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600">
                  <div className="bg-black p-[2px] rounded-full h-full w-full">
                    <img src={story.img} alt={story.user} className="rounded-full w-full h-full object-cover" />
                  </div>
                </div>
                <span className="text-xs text-neutral-300 truncate w-16 text-center">{story.user}</span>
              </div>
            ))}
          </div>

          {/* Posts Section */}
          <div className="flex flex-col items-center">
            {posts.map((post) => (
              <div key={post.id} className="w-full max-w-[470px] border-b border-neutral-800 pb-5 mb-5">
                
                {/* Post Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img src={post.userImg} alt="user" className="w-8 h-8 rounded-full object-cover" />
                    <span className="font-semibold text-sm">{post.user}</span>
                    {post.verified && <span className="text-blue-500 text-xs">✔</span>}
                    <span className="text-neutral-500 text-sm">• {post.time}</span>
                  </div>
                  <button className="text-neutral-300 hover:text-white font-bold tracking-widest">...</button>
                </div>

                {/* Post Image */}
                <div className="rounded border border-neutral-800 bg-neutral-900 flex items-center justify-center overflow-hidden">
                  <img src={post.postImg} alt="Post content" className="w-full object-cover max-h-[585px]" />
                </div>

                {/* Post Actions (Placeholder bars for buttons) */}
                <div className="flex justify-between mt-3 mb-2">
                  <div className="flex gap-4">
                    <div className="w-6 h-6 bg-white rounded-full opacity-20 hover:opacity-40 cursor-pointer"></div>
                    <div className="w-6 h-6 bg-white rounded-full opacity-20 hover:opacity-40 cursor-pointer"></div>
                    <div className="w-6 h-6 bg-white rounded-full opacity-20 hover:opacity-40 cursor-pointer"></div>
                  </div>
                  <div className="w-6 h-6 bg-white rounded-full opacity-20 hover:opacity-40 cursor-pointer"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Messages Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 hidden md:flex items-center gap-2 bg-neutral-900 rounded-full px-4 py-3 cursor-pointer shadow-lg hover:bg-neutral-800 border border-neutral-800">
        <div className="w-5 h-5 bg-white rounded-full opacity-20"></div>
        <span className="font-semibold text-sm">Messages</span>
      </div>

    </div>
  );
};

export default Home;