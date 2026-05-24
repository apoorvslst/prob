import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ authUser }) => {
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
        <div className="hidden md:flex flex-col w-[244px] border-r border-neutral-800 p-4 justify-between h-screen sticky top-0 shrink-0 bg-black text-white">
            <div>
                <div className="mb-8 mt-4 px-2">
                    <h1 className="text-xl font-bold tracking-wider italic font-serif">Instagram</h1>
                </div>
                <nav className="space-y-2">
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-900 transition-all duration-200 group"
                        >
                            <span className="text-[15px]">{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-auto px-2 pb-4">
                <button 
                    onClick={() => { localStorage.removeItem("user"); window.location.reload(); }}
                    className="flex items-center gap-4 p-3 w-full rounded-lg hover:bg-neutral-900 text-red-500 transition-all"
                >
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;