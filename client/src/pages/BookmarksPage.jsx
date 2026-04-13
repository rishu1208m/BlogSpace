import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { Bookmark, Heart, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const TAG_STYLES = {
    Tech: 'bg-purple-900/30 text-purple-300 border-purple-700/40',
    Design: 'bg-teal-900/30  text-teal-300   border-teal-700/40',
    Opinion: 'bg-orange-900/30 text-orange-300 border-orange-700/40',
    Tutorial: 'bg-blue-900/30  text-blue-300   border-blue-700/40',
    General: 'bg-slate-800/50 text-slate-400  border-slate-700/40',
}

export default function BookmarksPage() {
    const { user } = useAuth()
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get(`/users/${user.id}/bookmarks`)
                setPosts(data.bookmarks)
            } catch { toast.error('Could not load bookmarks') }
            finally { setLoading(false) }
        }
        if (user) fetch()
    }, [user])

    if (loading) return (
        <div className="max-w-2xl mx-auto animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-surface-border rounded-2xl" />
            ))}
        </div>
    )

    return (
        <div className="max-w-2xl mx-auto animate-in">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 bg-accent/15 border border-accent/30 rounded-xl
                        flex items-center justify-center">
                    <Bookmark size={16} className="text-accent" fill="currentColor" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold">Bookmarks</h1>
                    <p className="text-xs text-slate-500">{posts.length} saved {posts.length === 1 ? 'post' : 'posts'}</p>
                </div>
            </div>

            {posts.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-12 h-12 bg-surface-border rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Bookmark size={20} className="text-slate-500" />
                    </div>
                    <p className="text-slate-400 text-sm mb-1">No bookmarks yet</p>
                    <p className="text-slate-600 text-xs mb-6">Save posts you want to read later</p>
                    <Link to="/" className="btn-primary inline-flex text-xs">Browse posts</Link>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {posts.map(post => (
                        <Link key={post.id} to={`/post/${post.slug}`}>
                            <div className="card p-4 hover:border-accent/30 transition-all duration-200 hover:bg-surface-hover">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`tag-pill ${TAG_STYLES[post.tag] || TAG_STYLES.General}`}>{post.tag}</span>
                                    <span className="text-xs text-slate-600 ml-auto">
                                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <h3 className="text-sm font-medium text-slate-200 mb-3 hover:text-accent transition-colors leading-snug">
                                    {post.title}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent font-semibold">
                                            {post.author?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <span className="text-xs text-slate-500">{post.author?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-600">
                                        <span className="flex items-center gap-1"><Heart size={11} />{post._count?.likes || 0}</span>
                                        <span className="flex items-center gap-1"><MessageCircle size={11} />{post._count?.comments || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}