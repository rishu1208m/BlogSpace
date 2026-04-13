import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PenLine, Bookmark, LogOut, Feather, Menu, X, Home, User } from 'lucide-react'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/')
        setMenuOpen(false)
    }

    const close = () => setMenuOpen(false)

    return (
        <>
            <nav className="sticky top-0 z-50 border-b border-surface-border bg-dark-950/90 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

                    <Link to="/" className="flex items-center gap-2" onClick={close}>
                        <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                            <Feather size={14} className="text-white" />
                        </div>
                        <span className="font-semibold text-white text-sm tracking-tight">BlogSpace</span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden sm:flex items-center gap-1">
                        {user ? (
                            <>
                                <Link to="/new" className="btn-ghost flex items-center gap-1.5">
                                    <PenLine size={14} />
                                    <span>Write</span>
                                </Link>
                                <Link to="/bookmarks" className="btn-ghost">
                                    <Bookmark size={14} />
                                </Link>
                                <Link to={`/user/${user.id}`} className="btn-ghost flex items-center gap-2 ml-1">
                                    <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40
                                  flex items-center justify-center text-xs text-accent font-semibold">
                                        {user.name?.[0]?.toUpperCase()}
                                    </div>
                                </Link>
                                <button onClick={handleLogout} className="btn-ghost text-slate-500 hover:text-red-400">
                                    <LogOut size={14} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-ghost">Log in</Link>
                                <Link to="/register" className="btn-primary ml-1">Sign up</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile right side */}
                    <div className="flex sm:hidden items-center gap-2">
                        {user && (
                            <Link to="/new" className="w-8 h-8 flex items-center justify-center
                                         bg-accent rounded-lg text-white">
                                <PenLine size={14} />
                            </Link>
                        )}
                        <button
                            onClick={() => setMenuOpen(o => !o)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400
                         hover:text-slate-100 transition-colors"
                        >
                            {menuOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>

                </div>
            </nav>

            {/* Mobile menu overlay */}
            {menuOpen && (
                <div className="sm:hidden fixed inset-0 z-40 bg-dark-950/95 backdrop-blur-md flex flex-col"
                    style={{ top: '56px' }}>
                    <div className="flex flex-col p-6 gap-2">
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 p-4 card mb-4">
                                    <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40
                                  flex items-center justify-center text-sm text-accent font-semibold">
                                        {user.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">{user.name}</p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                    </div>
                                </div>

                                <Link to="/" onClick={close}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300
                             hover:bg-surface-hover transition-colors text-sm">
                                    <Home size={16} className="text-slate-400" /> Home
                                </Link>
                                <Link to="/new" onClick={close}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300
                             hover:bg-surface-hover transition-colors text-sm">
                                    <PenLine size={16} className="text-accent" /> Write a post
                                </Link>
                                <Link to="/bookmarks" onClick={close}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300
                             hover:bg-surface-hover transition-colors text-sm">
                                    <Bookmark size={16} className="text-slate-400" /> Bookmarks
                                </Link>
                                <Link to={`/user/${user.id}`} onClick={close}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300
                             hover:bg-surface-hover transition-colors text-sm">
                                    <User size={16} className="text-slate-400" /> My profile
                                </Link>

                                <div className="h-px bg-surface-border my-2" />

                                <button onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400
                             hover:bg-red-900/20 transition-colors text-sm w-full">
                                    <LogOut size={16} /> Log out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/" onClick={close}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300
                             hover:bg-surface-hover transition-colors text-sm">
                                    <Home size={16} className="text-slate-400" /> Home
                                </Link>
                                <div className="h-px bg-surface-border my-2" />
                                <Link to="/login" onClick={close} className="btn-outline text-center py-3">
                                    Log in
                                </Link>
                                <Link to="/register" onClick={close} className="btn-primary text-center py-3">
                                    Sign up free
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}