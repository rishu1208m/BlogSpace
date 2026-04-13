import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { body, validationResult } from 'express-validator'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { slugify } from '../utils/slugify.js'

const router = Router()

const postSelect = {
    id: true, title: true, slug: true, content: true,
    tag: true, coverImage: true, published: true,
    createdAt: true, updatedAt: true,
    author: { select: { id: true, name: true, avatarUrl: true } },
    _count: { select: { comments: true, likes: true } },
}

// GET /api/posts  — feed with search + pagination + tag filter
router.get('/', optionalAuth, async (req, res) => {
    const { search = '', tag = '', page = '1', limit = '6' } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = {
        published: true,
        ...(tag && { tag }),
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { tag: { contains: search, mode: 'insensitive' } },
            ],
        }),
    }

    try {
        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where, skip, take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                select: postSelect,
            }),
            prisma.post.count({ where }),
        ])

        // attach liked/bookmarked flags if user is logged in
        let enriched = posts
        if (req.user) {
            const [likes, bookmarks] = await Promise.all([
                prisma.like.findMany({
                    where: { userId: req.user.id, postId: { in: posts.map(p => p.id) } },
                }),
                prisma.bookmark.findMany({
                    where: { userId: req.user.id, postId: { in: posts.map(p => p.id) } },
                }),
            ])
            const likedSet = new Set(likes.map(l => l.postId))
            const bookmarkedSet = new Set(bookmarks.map(b => b.postId))
            enriched = posts.map(p => ({
                ...p,
                isLiked: likedSet.has(p.id),
                isBookmarked: bookmarkedSet.has(p.id),
            }))
        }

        res.json({
            posts: enriched,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// GET /api/posts/:slug  — single post
router.get('/:slug', optionalAuth, async (req, res) => {
    try {
        const post = await prisma.post.findUnique({
            where: { slug: req.params.slug },
            select: postSelect,
        })
        if (!post) return res.status(404).json({ message: 'Post not found' })

        let isLiked = false, isBookmarked = false
        if (req.user) {
            const [like, bookmark] = await Promise.all([
                prisma.like.findUnique({
                    where: { userId_postId: { userId: req.user.id, postId: post.id } },
                }),
                prisma.bookmark.findUnique({
                    where: { userId_postId: { userId: req.user.id, postId: post.id } },
                }),
            ])
            isLiked = !!like
            isBookmarked = !!bookmark
        }

        res.json({ post: { ...post, isLiked, isBookmarked } })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// POST /api/posts  — create post
router.post(
    '/',
    requireAuth,
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('content').trim().notEmpty().withMessage('Content is required'),
        body('tag').trim().notEmpty().withMessage('Tag is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg })
        }

        const { title, content, tag, coverImage } = req.body

        try {
            const slug = slugify(title)
            const post = await prisma.post.create({
                data: {
                    title, content, tag, slug,
                    coverImage: coverImage || null,
                    authorId: req.user.id,
                },
                select: postSelect,
            })
            res.status(201).json({ post })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error' })
        }
    }
)

// PUT /api/posts/:slug  — update post (author only)
router.put(
    '/:slug',
    requireAuth,
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('content').trim().notEmpty().withMessage('Content is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg })
        }

        try {
            const existing = await prisma.post.findUnique({
                where: { slug: req.params.slug },
            })
            if (!existing) return res.status(404).json({ message: 'Post not found' })
            if (existing.authorId !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized' })
            }

            const { title, content, tag, coverImage } = req.body
            const post = await prisma.post.update({
                where: { slug: req.params.slug },
                data: { title, content, tag, coverImage: coverImage || null },
                select: postSelect,
            })
            res.json({ post })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error' })
        }
    }
)

// DELETE /api/posts/:slug  — delete post (author only)
router.delete('/:slug', requireAuth, async (req, res) => {
    try {
        const existing = await prisma.post.findUnique({
            where: { slug: req.params.slug },
        })
        if (!existing) return res.status(404).json({ message: 'Post not found' })
        if (existing.authorId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' })
        }

        await prisma.post.delete({ where: { slug: req.params.slug } })
        res.json({ message: 'Post deleted' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// POST /api/posts/:slug/like  — toggle like
router.post('/:slug/like', requireAuth, async (req, res) => {
    try {
        const post = await prisma.post.findUnique({ where: { slug: req.params.slug } })
        if (!post) return res.status(404).json({ message: 'Post not found' })

        const existing = await prisma.like.findUnique({
            where: { userId_postId: { userId: req.user.id, postId: post.id } },
        })

        if (existing) {
            await prisma.like.delete({
                where: { userId_postId: { userId: req.user.id, postId: post.id } },
            })
            res.json({ liked: false })
        } else {
            await prisma.like.create({ data: { userId: req.user.id, postId: post.id } })
            res.json({ liked: true })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// POST /api/posts/:slug/bookmark  — toggle bookmark
router.post('/:slug/bookmark', requireAuth, async (req, res) => {
    try {
        const post = await prisma.post.findUnique({ where: { slug: req.params.slug } })
        if (!post) return res.status(404).json({ message: 'Post not found' })

        const existing = await prisma.bookmark.findUnique({
            where: { userId_postId: { userId: req.user.id, postId: post.id } },
        })

        if (existing) {
            await prisma.bookmark.delete({
                where: { userId_postId: { userId: req.user.id, postId: post.id } },
            })
            res.json({ bookmarked: false })
        } else {
            await prisma.bookmark.create({ data: { userId: req.user.id, postId: post.id } })
            res.json({ bookmarked: true })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

export default router