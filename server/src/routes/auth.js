import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { requireAuth } from '../middleware/auth.js'
import { authLimiter } from '../middleware/security.js'
import { verifyFirebaseToken } from '../lib/firebase.js'
import { prisma } from '../lib/prisma.js'
import { saveOTP, verifyOTP } from '../utils/otp.js'
import { sendOTPEmail } from '../utils/email.js'

const router = Router()

const generateToken = (user) =>
    jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )

const userResponse = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
})

// POST /api/auth/register/initiate
// Step 1 — validate details + send OTP (does NOT create account yet)
router.post(
    '/register/initiate',
    authLimiter,
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg })
        }

        const { name, email, password } = req.body

        try {
            const existing = await prisma.user.findUnique({ where: { email } })
            if (existing) {
                return res.status(400).json({ message: 'Email already registered. Please log in.' })
            }

            const passwordHash = await bcrypt.hash(password, 12)

            // Save pending registration data in OTP record
            const code = await saveOTP(email, 'register', JSON.stringify({ name, passwordHash }))
            await sendOTPEmail(email, code, name)

            res.json({ message: 'OTP sent to your email. Please verify to complete registration.' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Failed to send OTP. Try again.' })
        }
    }
)

// POST /api/auth/register/verify
// Step 2 — verify OTP + create account
router.post(
    '/register/verify',
    authLimiter,
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('code').isLength({ min: 6, max: 6 }).withMessage('Enter the 6-digit OTP'),
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg })
        }

        const { email, code } = req.body

        try {
            const result = await verifyOTP(email, code, 'register')
            if (!result.valid) {
                return res.status(400).json({ message: result.message })
            }

            // Get pending registration data
            const otpRecord = await prisma.otpCode.findFirst({
                where: { target: email, type: 'register', verified: true },
                orderBy: { createdAt: 'desc' },
            })

            if (!otpRecord) {
                return res.status(400).json({ message: 'Verification failed. Please try again.' })
            }

            const { name, passwordHash } = JSON.parse(otpRecord.metadata)

            // Create the account
            const user = await prisma.user.create({
                data: { name, email, passwordHash },
            })

            // Clean up OTP records
            await prisma.otpCode.deleteMany({ where: { target: email, type: 'register' } })

            const token = generateToken(user)
            res.status(201).json({ token, user: userResponse(user) })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error' })
        }
    }
)

// POST /api/auth/login
router.post(
    '/login',
    authLimiter,
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg })
        }

        const { email, password } = req.body

        try {
            const user = await prisma.user.findUnique({ where: { email } })
            if (!user || !user.passwordHash) {
                return res.status(401).json({ message: 'Invalid email or password' })
            }

            const valid = await bcrypt.compare(password, user.passwordHash)
            if (!valid) {
                return res.status(401).json({ message: 'Invalid email or password' })
            }

            const token = generateToken(user)
            res.json({ token, user: userResponse(user) })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: 'Server error' })
        }
    }
)

// POST /api/auth/google  — Google OAuth (email already verified by Google)
router.post('/google', authLimiter, async (req, res) => {
    const { firebaseToken } = req.body
    if (!firebaseToken) {
        return res.status(400).json({ message: 'Firebase token required' })
    }

    try {
        const decoded = await verifyFirebaseToken(firebaseToken)
        const { uid, email, name, picture } = decoded

        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    ...(email ? [{ email }] : []),
                    { firebaseUid: uid },
                ],
            },
        })

        if (user) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    firebaseUid: uid,
                    ...(picture && !user.avatarUrl && { avatarUrl: picture }),
                },
            })
        } else {
            user = await prisma.user.create({
                data: {
                    firebaseUid: uid,
                    name: name || email?.split('@')[0] || 'User',
                    email: email || null,
                    avatarUrl: picture || null,
                },
            })
        }

        const token = generateToken(user)
        res.json({ token, user: userResponse(user) })
    } catch (err) {
        console.error(err)
        res.status(401).json({ message: 'Google sign-in failed' })
    }
})

// POST /api/auth/forgot-password  — send reset OTP
router.post('/forgot-password', authLimiter, async (req, res) => {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    try {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return res.json({ message: 'If this email exists, a reset code has been sent.' })
        }

        const code = await saveOTP(email, 'reset')
        await sendOTPEmail(email, code, user.name, 'reset')

        res.json({ message: 'Password reset code sent to your email.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req, res) => {
    const { email, code, newPassword } = req.body
    if (!email || !code || !newPassword) {
        return res.status(400).json({ message: 'All fields required' })
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    try {
        const result = await verifyOTP(email, code, 'reset')
        if (!result.valid) {
            return res.status(400).json({ message: result.message })
        }

        const passwordHash = await bcrypt.hash(newPassword, 12)
        await prisma.user.update({ where: { email }, data: { passwordHash } })
        await prisma.otpCode.deleteMany({ where: { target: email, type: 'reset' } })

        res.json({ message: 'Password reset successfully. You can now log in.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } })
        if (!user) return res.status(404).json({ message: 'User not found' })
        res.json({ user: userResponse(user) })
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req, res) => {
    const { name, bio, avatarUrl } = req.body
    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(name && { name }),
                ...(bio !== undefined && { bio }),
                ...(avatarUrl !== undefined && { avatarUrl }),
            },
        })
        res.json({ user: userResponse(user) })
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

export default router