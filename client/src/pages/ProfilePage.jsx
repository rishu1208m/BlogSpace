import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUserProfile } from '../api/posts'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Edit2, FileText, Heart, Calendar, Save, X } from 'lucide-react'

const TAG_STYLES = {
    Tech: 'bg-purple-900/30 text-purple-300 border-purple-700/40',
    Design: 'bg-teal-900/30  text-teal-300   border-teal-700/40',
    Opinion: 'bg-orange-900/30 text-orange-300 border-orange-700/40',
    Tutorial: 'bg-blue-900/30  text-blue-300   border-blue-700/40',
    General: 'bg-slate-800/50 text-slate-400  border-slate-700/40',
}

export default function ProfilePage() {
    const { id } = useParams()
    const { user, updateUser } = useAuth()
    const [profile, setProfile] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ name: '', bio: '', avatarUrl: '' })
    const [saving, setSaving] = useState(false)

    const isOwner = user?.id === id

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await getUserProfile(id)
                setProfile(data.user)
                setPosts(data.posts)
                setForm({ name: data.user.name, bio: data.user.bio || '', avatarUrl: data.user.avatarUrl || '' })
            } catch { toast.error('User not found') }
            finally { setLoading(false) }
        }
        fetch()
    }, [id])

    const saveProfile = async () => {
        setSaving(true)
        try {
            const { data } = await api.put('/auth/profile', form)
            setProfile(p => ({ ...p, ...data.user }))
            updateUser(data.user)
            setEditing(false)
            toast.success('Profile updated!')
        } catch { toast.error('Could not update profile') }
        finally { setSaving(false) }
    }

    if (loading) return (
        <div className="max-w-2xl mx-auto animate-pulse space-y-4">
            <div className="h-24 bg-surface-border rounded-2xl" />
            <div className="h-48 bg-surface-border rounded-2xl" />
        </div>
    )

    if (!profile) return null

    const initials = profile.name?.[0]?.toUpperCase()

    return (
        <div className="max-w-2xl mx-auto animate-in">
            <div className="card p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30
                          flex items-center justify-center text-2xl font-semibold text-accent flex-shrink-0 overflow-hidden">
                        {profile.avatarUrl
                            ? <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                            : initials
                        }
                    </div>

                    <div className="flex-1 min-w-0">
                        {editing ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1 font-medium">Name</label>
                                    <input className="input" value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1 font-medium">Bio</label>
                                    <textarea className="textarea" rows={3} placeholder="Tell the world about yourself…"
                                        value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1 font-medium">Avatar URL</label>
                                    <input className="input" placeholder="https://example.com/avatar.jpg"
                                        value={form.avatarUrl} onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={saveProfile} disabled={saving}
                                        className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5">
                                        <Save size={12} /> {saving ? 'Saving…' : 'Save'}
                                    </button>
                                    <button onClick={() => setEditing(false)}
                                        className="btn-outline flex items-center gap-1.5 text-xs px-3 py-1.5">
                                        <X size={12} /> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-1">
                                    <h1 className="text-xl font-semibold truncate">{profile.name}</h1>
                                    {isOwner && (
                                        <button onClick={() => setEditing(true)}
                                            className="btn-ghost flex items-center gap-1.5 text-xs">
                                            <Edit2 size={12} /> Edit profile
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-slate-400 mb-3 leading-relaxed">
                                    {profile.bio || (isOwner ? 'Add a bio to tell people about yourself…' : 'No bio yet.')}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1.5">
                                        <FileText size={12} />
                                        {profile._count?.posts || 0} posts
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <h2 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Posts</h2>

            {posts.length === 0 ? (
                <div className="card p-8 text-center">
                    <p className="text-slate-500 text-sm">No posts yet.</p>
                    {isOwner && (
                        <Link to="/new" className="btn-primary inline-flex mt-4 text-xs">Write your first post</Link>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {posts.map(post => (
                        <Link key={post.id} to={`/post/${post.slug}`}>
                            <div className="card p-4 hover:border-accent/30 transition-all duration-200 hover:bg-surface-hover">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`tag-pill ${TAG_STYLES[post.tag] || TAG_STYLES.General}`}>{post.tag}</span>
                                    <span className="text-xs text-slate-600 ml-auto">
                                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <h3 className="text-sm font-medium text-slate-200 mb-2 hover:text-accent transition-colors">{post.title}</h3>
                                <div className="flex items-center gap-3 text-xs text-slate-600">
                                    <span className="flex items-center gap-1"><Heart size={11} /> {post._count?.likes || 0}</span>
                                    <span>{post._count?.comments || 0} comments</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}