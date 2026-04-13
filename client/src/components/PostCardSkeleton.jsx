export default function PostCardSkeleton() {
    return (
        <div className="card p-5 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-16 bg-surface-border rounded-full" />
                <div className="h-4 w-24 bg-surface-border rounded ml-auto" />
            </div>
            <div className="h-5 w-3/4 bg-surface-border rounded mb-2" />
            <div className="h-4 w-full bg-surface-border rounded mb-1" />
            <div className="h-4 w-2/3 bg-surface-border rounded mb-4" />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-surface-border" />
                    <div className="h-3 w-20 bg-surface-border rounded" />
                </div>
                <div className="h-3 w-16 bg-surface-border rounded" />
            </div>
        </div>
    )
}