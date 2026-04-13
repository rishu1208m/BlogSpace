import { useState } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
    const [local, setLocal] = useState(value)

    const handleKey = (e) => {
        if (e.key === 'Enter') onChange(local)
    }

    const clear = () => { setLocal(''); onChange('') }

    return (
        <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
                className="input pl-9 pr-8"
                placeholder="Search posts…"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                onKeyDown={handleKey}
                onBlur={() => onChange(local)}
            />
            {local && (
                <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    <X size={13} />
                </button>
            )}
        </div>
    )
}