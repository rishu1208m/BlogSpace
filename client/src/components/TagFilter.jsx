export default function TagFilter({ tags, active, onChange }) {
    return (
        <div className="flex gap-2 flex-wrap">
            {tags.map(tag => (
                <button
                    key={tag}
                    onClick={() => onChange(tag)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150
            ${active === tag
                            ? 'bg-accent/15 border-accent/50 text-accent'
                            : 'border-surface-border text-slate-500 hover:border-slate-500 hover:text-slate-300'
                        }`}
                >
                    {tag}
                </button>
            ))}
        </div>
    )
}