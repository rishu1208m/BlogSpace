import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PostPage from './pages/PostPage'
import NewPostPage from './pages/NewPostPage'
import EditPostPage from './pages/EditPostPage'
import ProfilePage from './pages/ProfilePage'
import BookmarksPage from './pages/BookmarksPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 pt-6 pb-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/post/:slug" element={<PostPage />} />
            <Route path="/user/:id" element={<ProfilePage />} />
            <Route path="/new" element={<ProtectedRoute><NewPostPage /></ProtectedRoute>} />
            <Route path="/edit/:slug" element={<ProtectedRoute><EditPostPage /></ProtectedRoute>} />
            <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}