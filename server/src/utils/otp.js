import { prisma } from '../lib/prisma.js'

export const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString()

export const saveOTP = async (target, type, metadata = '') => {
    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.otpCode.deleteMany({ where: { target, type } })

    await prisma.otpCode.create({
        data: { target, code, type, expiresAt, metadata },
    })

    return code
}

export const verifyOTP = async (target, code, type) => {
    const otp = await prisma.otpCode.findFirst({
        where: { target, code, type, verified: false },
        orderBy: { createdAt: 'desc' },
    })

    if (!otp) return { valid: false, message: 'Invalid OTP. Please check and try again.' }

    if (new Date() > otp.expiresAt) {
        await prisma.otpCode.delete({ where: { id: otp.id } })
        return { valid: false, message: 'OTP has expired. Please request a new one.' }
    }

    await prisma.otpCode.update({
        where: { id: otp.id },
        data: { verified: true },
    })

    return { valid: true }
}