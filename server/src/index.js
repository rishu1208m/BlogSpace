import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import { helmetMiddleware, generalLimiter, sanitize } from './middleware/security.js'
import authRoutes from './routes/auth.js'
import postRoutes from './routes/posts.js'
import commentRoutes from './routes/comments.js'
import userRoutes from './routes/users.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmetMiddleware)
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '10kb' }))
app.use(sanitize)
app.use(generalLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/users', userRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))