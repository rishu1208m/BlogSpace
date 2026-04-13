import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getPost, getComments, createComment, deleteComment, toggleLike, toggleBookmark, deletePost } from '../api/posts'
import { useAuth } from '../context/AuthContext'
import { Heart, Bookmark, ArrowLeft, Trash2, Edit2, Send, MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'

const TAG_STYLES = {
    Tech: 'bg-purple-900/30 text-purple-300 border-purple-700/40',
    Design: 'bg-teal-900/30  text-teal-300   border-teal-700/40',
    Opinion: 'bg-orange-900/30 text-orange-300 border-orange-700/40',
    Tutorial: 'bg-blue-900/30  text-blue-300   border-blue-700/40',
    General: 'bg-slate-800/50 text-slate-400  border-slate-700/40',
}

export default function PostPage() {
    const { slug } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [post, setPost] = useState(null)
    const [comments, setComments] = useState([])
    const [comment, setComment] = useState('')
    const [liked, setLiked] = useState(false)
    const [bookmarked, setBookmarked] = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    useEffect(() => {
        const fetch = async () => {
            try {
                const postRes = await getPost(slug)
                const p = postRes.data.post
                setPost(p)
                setLiked(p.isLiked || false)
                setBookmarked(p.isBookmarked || false)
                setLikeCount(p._count?.likes || 0)
                const commentsRes = await getComments(p.id)
                setComments(commentsRes.data.comments)
            } catch {
                toast.error('Post not found')
                navigate('/')
            } finally { setLoading(false) }
        }
        fetch()
    }, [slug, navigate])

    const handleLike = async () => {
        if (!user) return toast.error('Log in to like posts')
        try {
            const { data } = await toggleLike(slug)
            setLiked(data.liked)
            setLikeCount(c => data.liked ? c + 1 : c - 1)
        } catch { toast.error('Something went wrong') }
    }

    const handleBookmark = async () => {
        if (!user) return toast.error('Log in to bookmark')
        try {
            const { data } = await toggleBookmark(slug)
            setBookmarked(data.bookmarked)
            toast.success(data.bookmarked ? 'Bookmarked!' : 'Removed bookmark')
        } catch { toast.error('Something went wrong') }
    }

    const handleDelete = async () => {
        if (!confirm('Delete this post permanently?')) return
        try {
            await deletePost(slug)
            toast.success('Post deleted')
            navigate('/')
        } catch { toast.error('Could not delete') }
    }

    const submitComment = async (e) => {
        e.preventDefault()
        if (!comment.trim()) return
        setSubmitting(true)
        try {
            const { data } = await createComment(post.id, comment)
            setComments(c => [...c, data.comment])
            setComment('')
        } catch { toast.error('Could not post comment') }
        finally { setSubmitting(false) }
    }

    const handleDeleteComment = async (id) => {
        try {
            await deleteComment(id)
            setComments(c => c.filter(x => x.id !== id))
        } catch { toast.error('Could not delete comment') }
    }

    if (loading) return (
        <div className="max-w-2xl mx-auto animate-pulse space-y-4 pt-4">
            <div className="h-8 w-3/4 bg-surface-border rounded" />
            <div className="h-4 w-1/2 bg-surface-border rounded" />
            <div className="h-64 bg-surface-border rounded-2xl" />
        </div>
    )

    if (!post) return null

    const isAuthor = user?.id === post.author?.id
    const tagStyle = TAG_STYLES[post.tag] || TAG_STYLES.General

    return (
        <div className="max-w-2xl mx-auto animate-in">
            <button onClick={() => navigate(-1)}
                className="btn-ghost flex items-center gap-2 mb-4 sm:mb-6 -ml-2">
                <ArrowLeft size={14} /> Back
            </button>

            <div className="flex items-center gap-2 mb-3">
                <span className={`tag-pill ${tagStyle}`}>{post.tag}</span>
                <span className="text-xs text-slate-500 ml-auto">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                    })}
                </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold leading-snug mb-4">{post.title}</h1>

            <div className="flex items-center justify-between mb-6 pb-5 border-b border-surface-border">
                <Link to={`/user/${post.author?.id}`} className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30
                          flex items-center justify-center text-sm text-accent font-semibold">
                        {post.author?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-accent transition-colors truncate max-w-[120px] sm:max-w-none">
                        {post.author?.name}
                    </span>
                </Link>

                <div className="flex items-center gap-2">
                    <button onClick={handleLike}
                        className={`flex items-center gap-1.5 text-sm px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all
              ${liked
                                ? 'bg-pink-900/20 border-pink-700/40 text-pink-400'
                                : 'border-surface-border text-slate-500 hover:text-pink-400'
                            }`}>
                        <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                        <span>{likeCount}</span>
                    </button>

                    <button onClick={handleBookmark}
                        className={`p-1.5 rounded-lg border transition-all
              ${bookmarked
                                ? 'bg-accent/10 border-accent/30 text-accent'
                                : 'border-surface-border text-slate-500 hover:text-accent'
                            }`}>
                        <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} />
                    </button>

                    {isAuthor && (
                        <div className="relative">
                            <button onClick={() => setShowMenu(s => !s)}
                                className="p-1.5 rounded-lg border border-surface-border text-slate-500
                           hover:text-slate-300 transition-all">
                                <MoreVertical size={14} />
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 top-9 bg-surface-raised border border-surface-border
                                rounded-xl overflow-hidden z-10 min-w-[140px]">
                                    <button onClick={() => { navigate(`/edit/${slug}`); setShowMenu(false) }}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300
                               hover:bg-surface-hover w-full text-left">
                                        <Edit2 size={13} /> Edit post
                                    </button>
                                    <button onClick={handleDelete}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400
                               hover:bg-red-900/20 w-full text-left">
                                        <Trash2 size={13} /> Delete post
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-10">
                {post.content.split('\n').map((para, i) =>
                    para
                        ? <p key={i} className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4">{para}</p>
                        : <br key={i} />
                )}
            </div>

            {/* Comments */}
            <div className="border-t border-surface-border pt-6 sm:pt-8">
                <h3 className="text-sm font-semibold mb-5 text-slate-300">
                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </h3>

                {user ? (
                    <form onSubmit={submitComment} className="flex gap-2 sm:gap-3 mb-6 sm:mb-8">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent/20 border border-accent/30
                            flex items-center justify-center text-xs text-accent font-semibold flex-shrink-0 mt-1">
                            {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 relative">
                            <textarea
                                className="textarea pr-10 min-h-[72px] text-sm"
                                placeholder="Write a comment…"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                            />
                            <button type="submit" disabled={submitting || !comment.trim()}
                                className="absolute right-3 bottom-3 text-accent disabled:opacity-30
                           hover:text-accent-hover transition-colors">
                                <Send size={14} />
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="card p-4 mb-6 text-center">
                        <p className="text-sm text-slate-400">
                            <Link to="/login" className="link font-medium">Log in</Link> to leave a comment
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    {comments.map(c => (
                        <div key={c.id} className="flex gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-surface-border
                              flex items-center justify-center text-xs text-slate-400
                              font-semibold flex-shrink-0 mt-0.5">
                                {c.author?.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 card p-3">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium text-slate-300">{c.author?.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-600">
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </span>
                                        {user?.id === c.author?.id && (
                                            <button onClick={() => handleDeleteComment(c.id)}
                                                className="text-slate-600 hover:text-red-400 transition-colors">
                                                <Trash2 size={11} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{c.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}