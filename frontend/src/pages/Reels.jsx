import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Component to handle auto-playing videos when they scroll into view
const ReelVideo = ({ src }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.6 // Play when 60% of the video is in view
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(err => console.error("Video play error:", err));
        } else {
          videoRef.current?.pause();
        }
      });
    }, options);

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      loop
      muted
      playsInline
      className="w-full h-full object-cover"
    />
  );
};

const Reels = ({ authUser }) => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [newComment, setNewComment] = useState("");

  // Helper: normalize legacy disk paths to proper web URLs
  const getPostImageUrl = (path) => {
    if (!path) return '';
    let url = path.replace(/\\/g, '/');
    if (url.startsWith('public/')) url = url.slice(6);
    if (!url.startsWith('/') && !url.startsWith('http')) url = '/' + url;
    
    // Fix existing localhost URLs stored in the DB during local dev
    if (url.startsWith('http://localhost:8000')) {
      url = url.replace('http://localhost:8000', '');
    }

    // If it's a relative path, prefix it with the backend URL
    if (url.startsWith('/')) {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      return baseUrl ? `${baseUrl}${url}` : url;
    }
    return url;
  };

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
    }
  }, [authUser, navigate]);

  // Fetch real reels from your database reels route
  useEffect(() => {
    if (!authUser) return; // Don't fetch if not authenticated
    const fetchReels = async () => {
      try {
        const res = await axios.get('/api/post/reels', {
          withCredentials: true
        });
        setPosts(res.data);
      } catch (error) {
        console.error("Failed to fetch reels:", error);
      }
    };
    fetchReels();
  }, [authUser]);

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`/api/post/like/${postId}`, {}, {
        withCredentials: true
      });

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


  return (
    <div className="flex h-screen font-sans overflow-hidden bg-black text-white">
      {/* MAIN REELS FEED */}
      <div className="flex-1 overflow-y-auto flex justify-center snap-y snap-mandatory scrollbar-hide">
        <div className="w-full max-w-[400px] h-full">

          {posts.length === 0 ? (
            <div className="text-neutral-500 mt-20 text-lg text-center">No reels found. Be the first to create one!</div>
          ) : (
            posts.map((post) => {
              const isLikedByMe = post.likedBy?.includes(authUser?._id);

              return (
                <div key={post._id} className="w-full h-[90vh] md:h-screen snap-start relative bg-black flex items-center justify-center overflow-hidden border-b border-neutral-900">
                  
                  {/* Media */}
                  <div className="w-full h-full relative">
                      {(() => {
                        const mediaItems = post.media?.length > 0 
                          ? post.media 
                          : (post.photo || post.image ? [{ url: post.photo || post.image, mediaType: 'image' }] : []);
                        
                        // For reels, usually we just show the first media item
                        const item = mediaItems[0];
                        if (!item) return null;

                        return item.mediaType === 'video' ? (
                          <ReelVideo src={getPostImageUrl(item.url)} />
                        ) : (
                          <img src={getPostImageUrl(item.url)} alt="Reel" className="w-full h-full object-cover" />
                        );
                      })()}
                  </div>

                  {/* Actions Overlay (Right Side) */}
                  <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-10">
                    {/* Like */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleLike(post._id)}
                        className="bg-black/40 backdrop-blur-sm p-3 rounded-full hover:bg-black/60 transition-all focus:outline-none"
                      >
                        {isLikedByMe ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-red-500">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-7 h-7 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                          </svg>
                        )}
                      </button>
                      <span className="text-sm font-semibold drop-shadow-md">{post.likedBy?.length || 0}</span>
                    </div>

                    {/* Comment */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => setActiveCommentPost(post)}
                        className="bg-black/40 backdrop-blur-sm p-3 rounded-full hover:bg-black/60 transition-all focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-7 h-7 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.92 1.786c-.082.1-.012.285.121.285a10.58 10.58 0 003.977-1.157c.38-.13.844-.098 1.21.127A10.12 10.12 0 0012 20.25Z" />
                        </svg>
                      </button>
                      <span className="text-sm font-semibold drop-shadow-md">{post.comments?.length || 0}</span>
                    </div>
                  </div>

                  {/* Info Overlay (Bottom Left) */}
                  <div className="absolute left-4 bottom-4 right-20 z-10 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={post.owner?.profilePic || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} alt="user" className="w-10 h-10 rounded-full object-cover border-2 border-white" />
                      <span className="font-bold text-[15px] drop-shadow-md">{post.owner?.username}</span>
                    </div>
                    {post.description && (
                      <p className="text-sm text-neutral-100 drop-shadow-md line-clamp-2">{post.description}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
          
          {/* Comments Modal Overlay */}
          {activeCommentPost && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg w-full max-w-[400px] h-[70vh] flex flex-col overflow-hidden shadow-2xl relative">

                {/* Close Button */}
                <button
                  onClick={() => setActiveCommentPost(null)}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xl z-50 font-bold"
                >
                  ✕
                </button>

                {/* Comments Side */}
                <div className="w-full flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center gap-2 p-4 border-b border-neutral-900">
                    <span className="font-semibold text-lg">Comments</span>
                  </div>

                  {/* Scrollable list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeCommentPost.description && (
                      <div className="flex gap-2 text-sm items-start">
                        <img
                          src={activeCommentPost.owner?.profilePic || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                          alt="user"
                          className="w-8 h-8 rounded-full object-cover mt-0.5"
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
                            className="w-8 h-8 rounded-full object-cover mt-0.5"
                          />
                          <div>
                            <span className="font-bold mr-2">{comment.user?.username}</span>
                            <span className="text-neutral-300">{comment.text}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input box */}
                  <form onSubmit={handleAddComment} className="p-4 border-t border-neutral-900 flex gap-2 bg-neutral-950">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
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

        </div>
      </div>
    </div>
  );
};

export default Reels;
