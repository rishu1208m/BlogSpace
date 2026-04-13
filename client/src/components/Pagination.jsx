import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ current, total, onChange }) {
    const pages = Array.from({ length: total }, (_, i) => i + 1)

    return (
        <div className="flex items-center justify-center gap-1 mt-8">
            <button
                onClick={() => onChange(current - 1)}
                disabled={current === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-border
                   text-slate-400 hover:text-slate-100 hover:border-slate-500
                   disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft size={14} />
            </button>

            {pages.map(p => (
                <button
                    key={p}
                    onClick={() => onChange(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all
            ${p === current
                            ? 'bg-accent text-white border border-accent'
                            : 'border border-surface-border text-slate-400 hover:border-slate-500 hover:text-slate-100'
                        }`}
                >
                    {p}
                </button>
            ))}

            <button
                onClick={() => onChange(current + 1)}
                disabled={current === total}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-border
                   text-slate-400 hover:text-slate-100 hover:border-slate-500
                   disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ChevronRight size={14} />
            </button>
        </div>
    )
}