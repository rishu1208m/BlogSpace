import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

export const sendOTPSms = async (phone, otp) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10)

    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
        params: {
            authorization: process.env.FAST2SMS_API_KEY,
            message: `Your BlogSpace OTP is ${otp}. Valid for 10 minutes. Do not share.`,
            language: 'english',
            route: 'q',
            numbers: cleanPhone,
        },
        headers: {
            'cache-control': 'no-cache',
        },
    })

    console.log('Fast2SMS response:', response.data)

    if (!response.data.return) {
        throw new Error(response.data.message || 'Failed to send SMS')
    }

    return response.data
}