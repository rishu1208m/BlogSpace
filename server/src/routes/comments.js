import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { body, validationResult } from 'express-validator'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/comments/post/:postId
router.get('/post/:postId', async (req, res) => {
    try {
        const comments = await prisma.comment.findMany({
            where: { postId: req.params.postId },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true, content: true, createdAt: true,
                author: { select: { id: true, name: true, avatarUrl: true } },
            },
        })
        res.json({ comments })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// POST /api/comments/post/:postId
router.post(
    '/post/:postId',
    requireAuth,
    [body('content').trim().notEmpty().withMessage('Comment cannot be empty')],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg })
        }

        try {
            const post = await prisma.post.findUnique({ where: { id: req.params.postId } })
            if (!post) return res.status(404).json({ message: 'Post not found' })

            const comment = await prisma.comment.create({
                data: {
                    content: req.body.content,
                    postId: req.params.postId,
                    authorId: req.user.id,
                },
                select: {
                    id: true, content: true, createdAt: true,
                    author: { select: { id: true, name: true, avatarUrl: true } },
                },
            })
            res.status(201).json({ comment })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error' })
        }
    }
)

// DELETE /api/comments/:id
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const comment = await prisma.comment.findUnique({ where: { id: req.params.id } })
        if (!comment) return res.status(404).json({ message: 'Comment not found' })
        if (comment.authorId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' })
        }
        await prisma.comment.delete({ where: { id: req.params.id } })
        res.json({ message: 'Comment deleted' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

export default router