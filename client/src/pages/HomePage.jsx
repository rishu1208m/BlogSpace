import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPosts } from '../api/posts'
import PostCard from '../components/PostCard'
import PostCardSkeleton from '../components/PostCardSkeleton'
import Pagination from '../components/Pagination'
import { Search, X, SlidersHorizontal } from 'lucide-react'

const TAGS = ['All', 'Tech', 'Design', 'Opinion', 'Tutorial', 'General']

export default function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [posts, setPosts] = useState([])
    const [pagination, setPagination] = useState(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [showTags, setShowTags] = useState(false)

    const tag = searchParams.get('tag') || ''
    const page = parseInt(searchParams.get('page') || '1')

    const fetchPosts = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await getPosts({
                search: searchParams.get('search') || '',
                tag, page, limit: 5
            })
            setPosts(data.posts)
            setPagination(data.pagination)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [searchParams, tag, page])

    useEffect(() => { fetchPosts() }, [fetchPosts])

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams)
        if (value) next.set(key, value)
        else next.delete(key)
        if (key !== 'page') next.delete('page')
        setSearchParams(next)
    }

    const handleSearch = (e) => {
        if (e.key === 'Enter') setParam('search', search)
    }

    const updatePost = (updated) => {
        setPosts(ps => ps.map(p => p.id === updated.id ? updated : p))
    }

    const removePost = (id) => {
        setPosts(ps => ps.filter(p => p.id !== id))
    }

    return (
        <div className="animate-in">
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold mb-1">Latest posts</h1>
                <p className="text-slate-400 text-sm">Discover stories from the community</p>
            </div>

            {/* Search + filter row */}
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        className="input pl-9 pr-8 h-10"
                        placeholder="Search posts…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={handleSearch}
                        onBlur={() => setParam('search', search)}
                    />
                    {search && (
                        <button
                            onClick={() => { setSearch(''); setParam('search', '') }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setShowTags(s => !s)}
                    className={`sm:hidden flex items-center gap-1.5 px-3 h-10 rounded-xl border text-xs font-medium transition-all
            ${showTags || tag
                            ? 'bg-accent/15 border-accent/50 text-accent'
                            : 'border-surface-border text-slate-400'
                        }`}
                >
                    <SlidersHorizontal size={13} />
                    {tag || 'Filter'}
                </button>
            </div>

            {/* Tag filters — always visible on desktop, toggle on mobile */}
            <div className={`${showTags ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2 mb-6`}>
                {TAGS.map(t => (
                    <button
                        key={t}
                        onClick={() => {
                            setParam('tag', t === 'All' ? '' : t)
                            setShowTags(false)
                        }}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all
              ${(tag || 'All') === t
                                ? 'bg-accent/15 border-accent/50 text-accent'
                                : 'border-surface-border text-slate-500 hover:border-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)}
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-slate-400 text-sm mb-3">No posts found.</p>
                    {(search || tag) && (
                        <button
                            className="btn-outline text-xs px-4 py-2"
                            onClick={() => { setSearch(''); setSearchParams({}) }}
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} onUpdate={updatePost} onDelete={removePost} />
                    ))}
                </div>
            )}

            {pagination && pagination.totalPages > 1 && (
                <Pagination
                    current={page}
                    total={pagination.totalPages}
                    onChange={p => setParam('page', p)}
                />
            )}
        </div>
    )
}