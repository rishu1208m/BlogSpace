import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Bookmark, MessageCircle, Trash2, Edit2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { toggleLike, toggleBookmark, deletePost } from '../api/posts'
import toast from 'react-hot-toast'

const TAG_STYLES = {
    Tech: 'bg-purple-900/30 text-purple-300 border-purple-700/40',
    Design: 'bg-teal-900/30  text-teal-300   border-teal-700/40',
    Opinion: 'bg-orange-900/30 text-orange-300 border-orange-700/40',
    Tutorial: 'bg-blue-900/30  text-blue-300   border-blue-700/40',
    General: 'bg-slate-800/50 text-slate-400  border-slate-700/40',
}

export default function PostCard({ post, onUpdate, onDelete }) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [liked, setLiked] = useState(post.isLiked || false)
    const [bookmarked, setBookmarked] = useState(post.isBookmarked || false)
    const [likeCount, setLikeCount] = useState(post._count?.likes || 0)

    const isAuthor = user?.id === post.author?.id
    const tagStyle = TAG_STYLES[post.tag] || TAG_STYLES.General
    const excerpt = post.content?.slice(0, 120) + (post.content?.length > 120 ? '…' : '')

    const handleLike = async (e) => {
        e.preventDefault()
        if (!user) return toast.error('Log in to like posts')
        try {
            const { data } = await toggleLike(post.slug)
            setLiked(data.liked)
            setLikeCount(c => data.liked ? c + 1 : c - 1)
            if (onUpdate) onUpdate({ ...post, isLiked: data.liked })
        } catch { toast.error('Something went wrong') }
    }

    const handleBookmark = async (e) => {
        e.preventDefault()
        if (!user) return toast.error('Log in to bookmark posts')
        try {
            const { data } = await toggleBookmark(post.slug)
            setBookmarked(data.bookmarked)
            toast.success(data.bookmarked ? 'Bookmarked!' : 'Removed bookmark')
            if (onUpdate) onUpdate({ ...post, isBookmarked: data.bookmarked })
        } catch { toast.error('Something went wrong') }
    }

    const handleDelete = async (e) => {
        e.preventDefault()
        if (!confirm('Delete this post?')) return
        try {
            await deletePost(post.slug)
            toast.success('Post deleted')
            if (onDelete) onDelete(post.id)
        } catch { toast.error('Could not delete post') }
    }

    return (
        <Link to={`/post/${post.slug}`} className="block group">
            <div className="card p-4 sm:p-5 hover:border-accent/30 transition-all duration-200
                      group-hover:bg-surface-hover">
                <div className="flex items-center gap-2 mb-2.5">
                    <span className={`tag-pill ${tagStyle} text-xs`}>{post.tag}</span>
                    <span className="text-xs text-slate-500 ml-auto">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                        })}
                    </span>
                </div>

                <h2 className="text-sm sm:text-base font-semibold text-slate-100 mb-2 leading-snug
                       group-hover:text-accent transition-colors line-clamp-2">
                    {post.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-3 line-clamp-2">
                    {excerpt}
                </p>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30
                            flex items-center justify-center text-xs text-accent font-semibold flex-shrink-0">
                            {post.author?.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-400 truncate">{post.author?.name}</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <button onClick={handleLike}
                            className={`flex items-center gap-1 text-xs transition-colors
                ${liked ? 'text-pink-400' : 'text-slate-500 hover:text-pink-400'}`}>
                            <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
                            <span>{likeCount}</span>
                        </button>

                        <span className="flex items-center gap-1 text-xs text-slate-500">
                            <MessageCircle size={13} />
                            <span>{post._count?.comments || 0}</span>
                        </span>

                        <button onClick={handleBookmark}
                            className={`transition-colors ${bookmarked ? 'text-accent' : 'text-slate-500 hover:text-accent'}`}>
                            <Bookmark size={13} fill={bookmarked ? 'currentColor' : 'none'} />
                        </button>

                        {isAuthor && (
                            <>
                                <button onClick={e => { e.preventDefault(); navigate(`/edit/${post.slug}`) }}
                                    className="text-slate-500 hover:text-slate-300 transition-colors hidden sm:block">
                                    <Edit2 size={13} />
                                </button>
                                <button onClick={handleDelete}
                                    className="text-slate-500 hover:text-red-400 transition-colors hidden sm:block">
                                    <Trash2 size={13} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}