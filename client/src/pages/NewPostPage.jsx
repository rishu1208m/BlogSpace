import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPost } from '../api/posts'
import toast from 'react-hot-toast'
import { ArrowLeft, Send } from 'lucide-react'

const TAGS = ['Tech', 'Design', 'Opinion', 'Tutorial', 'General']

export default function NewPostPage() {
    const [form, setForm] = useState({ title: '', content: '', tag: 'General', coverImage: '' })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const submit = async (e) => {
        e.preventDefault()
        if (!form.title.trim() || !form.content.trim()) {
            return toast.error('Title and content are required')
        }
        setLoading(true)
        try {
            const { data } = await createPost(form)
            toast.success('Post published!')
            navigate(`/post/${data.post.slug}`)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not publish post')
        } finally { setLoading(false) }
    }

    return (
        <div className="max-w-2xl mx-auto animate-in px-0 sm:px-4">
            <button onClick={() => navigate(-1)}
                className="btn-ghost flex items-center gap-2 mb-4 sm:mb-6 -ml-2">
                <ArrowLeft size={14} /> Back
            </button>

            <h1 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8">Write a new post</h1>

            <form onSubmit={submit} className="space-y-4 sm:space-y-5">
                <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Title</label>
                    <input
                        className="input text-base sm:text-lg font-medium"
                        name="title"
                        placeholder="Give your post a great title…"
                        value={form.title}
                        onChange={handle}
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Tag</label>
                    <div className="flex gap-2 flex-wrap">
                        {TAGS.map(t => (
                            <button key={t} type="button"
                                onClick={() => setForm(f => ({ ...f, tag: t }))}
                                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all
                  ${form.tag === t
                                        ? 'bg-accent/15 border-accent/50 text-accent'
                                        : 'border-surface-border text-slate-500 hover:border-slate-500'
                                    }`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                        Cover image URL <span className="text-slate-600">(optional)</span>
                    </label>
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
                        placeholder="Write your post here…"
                        value={form.content}
                        onChange={handle}
                        rows={14}
                        required
                    />
                </div>

                <div className="flex gap-3 pt-2 pb-6">
                    <button type="submit" className="btn-primary flex items-center gap-2 flex-1 sm:flex-none justify-center"
                        disabled={loading}>
                        <Send size={14} />
                        {loading ? 'Publishing…' : 'Publish post'}
                    </button>
                    <button type="button" onClick={() => navigate(-1)} className="btn-outline flex-1 sm:flex-none text-center">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}