import jwt from 'jsonwebtoken'

export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authenticated' })
    }
    try {
        const token = authHeader.split(' ')[1]
        req.user = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch {
        res.status(401).json({ message: 'Invalid or expired token' })
    }
}

export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
        try {
            req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET)
        } catch { }
    }
    next()
}