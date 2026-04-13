import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPost, updatePost } from '../api/posts'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'

const TAGS = ['Tech', 'Design', 'Opinion', 'Tutorial', 'General']

export default function EditPostPage() {
    const { slug } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ title: '', content: '', tag: 'General', coverImage: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await getPost(slug)
                const p = data.post
                if (p.author?.id !== user?.id) {
                    toast.error('Not authorized')
                    return navigate('/')
                }
                setForm({ title: p.title, content: p.content, tag: p.tag, coverImage: p.coverImage || '' })
            } catch {
                toast.error('Post not found')
                navigate('/')
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [slug, user, navigate])

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const submit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const { data } = await updatePost(slug, form)
            toast.success('Post updated!')
            navigate(`/post/${data.post.slug}`)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not update post')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="max-w-2xl mx-auto animate-pulse space-y-4">
            <div className="h-8 w-1/2 bg-surface-border rounded" />
            <div className="h-48 bg-surface-border rounded-2xl" />
        </div>
    )

    return (
        <div className="max-w-2xl mx-auto animate-in">
            <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 mb-6 -ml-2">
                <ArrowLeft size={14} /> Back
            </button>

            <h1 className="text-2xl font-semibold mb-8">Edit post</h1>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Title</label>
                    <input
                        className="input text-lg font-medium"
                        name="title"
                        value={form.title}
                        onChange={handle}
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Tag</label>
                    <div className="flex gap-2 flex-wrap">
                        {TAGS.map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setForm(f => ({ ...f, tag: t }))}
                                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all
                  ${form.tag === t
                                        ? 'bg-accent/15 border-accent/50 text-accent'
                                        : 'border-surface-border text-slate-500 hover:border-slate-500'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Cover image URL (optional)</label>
                    <input
                        className="input"
                        name="coverImage"
                        placeholder="https://example.com/image.jpg"
                        value={form.coverImage}
                        onChange={handle}
                    />
                </div>

                <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Content</label>
                    <textarea
                        className="textarea"
                        name="content"
                        value={form.content}
                        onChange={handle}
                        rows={16}
                        required
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
                        <Save size={14} />
                        {saving ? 'Saving…' : 'Save changes'}
                    </button>
                    <button type="button" onClick={() => navigate(-1)} className="btn-outline">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}