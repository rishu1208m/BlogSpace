import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/users/:id — public profile
router.get('/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true, name: true, bio: true,
                avatarUrl: true, createdAt: true,
                _count: { select: { posts: true, likes: true } },
            },
        })
        if (!user) return res.status(404).json({ message: 'User not found' })

        const posts = await prisma.post.findMany({
            where: { authorId: req.params.id, published: true },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, title: true, slug: true, tag: true, createdAt: true,
                _count: { select: { likes: true, comments: true } },
            },
        })

        res.json({ user, posts })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// GET /api/users/:id/bookmarks
router.get('/:id/bookmarks', requireAuth, async (req, res) => {
    if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: 'Not authorized' })
    }
    try {
        const bookmarks = await prisma.bookmark.findMany({
            where: { userId: req.params.id },
            orderBy: { id: 'desc' },
            select: {
                post: {
                    select: {
                        id: true, title: true, slug: true, tag: true, createdAt: true,
                        author: { select: { id: true, name: true, avatarUrl: true } },
                        _count: { select: { likes: true, comments: true } },
                    },
                },
            },
        })
        res.json({ bookmarks: bookmarks.map(b => b.post) })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

export default router