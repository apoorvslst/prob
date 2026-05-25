import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = ({ authUser }) => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [newComment, setNewComment] = useState("");

  // Helper: normalize legacy disk paths to proper web URLs
  const getPostImageUrl = (path) => {
    if (!path) return '';
    // Replace backslashes with forward slashes
    let url = path.replace(/\\/g, '/');
    // Strip leading 'public/' if present
    if (url.startsWith('public/')) url = url.slice(6);
    // Ensure it starts with /
    if (!url.startsWith('/') && !url.startsWith('http')) url = '/' + url;
    return url;
  };


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
        const res = await axios.get('/api/post/feed', {
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
      const res = await axios.post(`/api/post/like/${postId}`, {}, {
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
    <div className="flex h-screen font-sans overflow-hidden">
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

                    {/* Post Media */}
                    <div className="rounded-sm border border-neutral-800 bg-neutral-900 flex items-center justify-center overflow-hidden relative">
                      <div className="flex overflow-x-auto snap-x snap-mandatory w-full scrollbar-hide">
                        {(() => {
                          const mediaItems = post.media?.length > 0 
                            ? post.media 
                            : (post.photo || post.image ? [{ url: post.photo || post.image, mediaType: 'image' }] : []);
                          
                          return mediaItems.map((item, index) => (
                            <div key={index} className="min-w-full snap-center flex items-center justify-center bg-black">
                              {item.mediaType === 'video' ? (
                                <video src={getPostImageUrl(item.url)} controls className="w-full object-contain max-h-[585px]" />
                              ) : (
                                <img src={getPostImageUrl(item.url)} alt={`Media ${index}`} className="w-full object-contain max-h-[585px]" />
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Post Actions & Counts */}
                    <div className="flex gap-6 mt-4 mb-3 px-1">
                      {/* Like Column */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleLike(post._id)}
                          className="focus:outline-none transition-transform active:scale-90 cursor-pointer"
                        >
                          {isLikedByMe ? (
                            /* Filled Heart SVG */
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-500">
                              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                            </svg>
                          ) : (
                            /* Outline Heart SVG */
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6 text-white hover:text-neutral-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                            </svg>
                          )}
                        </button>
                        <span className="text-xs text-neutral-400 font-semibold">{post.likedBy?.length || 0}</span>
                      </div>

                      {/* Comment Column */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => setActiveCommentPost(post)}
                          className="focus:outline-none transition-transform active:scale-90 cursor-pointer"
                        >
                          {/* Outline Comment Bubble SVG */}
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6 text-white hover:text-neutral-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.92 1.786c-.082.1-.012.285.121.285a10.58 10.58 0 003.977-1.157c.38-.13.844-.098 1.21.127A10.12 10.12 0 0012 20.25Z" />
                          </svg>
                        </button>
                        <span className="text-xs text-neutral-400 font-semibold">{post.comments?.length || 0}</span>
                      </div>
                    </div>

                    {/* Caption */}
                    <div className="px-1 text-sm mb-2">
                      <span className="font-bold mr-2">{post.owner?.username}</span>
                      <span>{post.description}</span>
                    </div>

                    {post.comments?.length > 0 && (
                      <div
                        onClick={() => setActiveCommentPost(post)}
                        className="px-1 text-xs text-neutral-500 cursor-pointer mt-1 hover:underline"
                      >
                        View all {post.comments.length} comments
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          {/* Comments Modal Overlay */}
          {activeCommentPost && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative">

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

                  {/* Scrollable list */}
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


        </div>
      </div>
    </div>
  );
};

export default Home;