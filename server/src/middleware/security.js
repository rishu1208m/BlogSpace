import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

export const helmetMiddleware = helmet({
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
})

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
})

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many auth attempts, please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
})

export const sanitize = (req, res, next) => {
    const clean = (obj) => {
        if (!obj) return obj
        for (const key of Object.keys(obj)) {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].replace(/[<>]/g, '').trim()
            } else if (typeof obj[key] === 'object') {
                clean(obj[key])
            }
        }
        return obj
    }
    clean(req.body)
    next()
}