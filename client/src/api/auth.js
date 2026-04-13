import api from './axios'

export const sendOTP = (type, target) => api.post('/auth/send-otp', { type, target })
export const verifyOTP = (type, target, code, name) => api.post('/auth/verify-otp', { type, target, code, name })
export const loginUser = (email, password) => api.post('/auth/login', { email, password })
export const registerUser = (name, email, password) => api.post('/auth/register', { name, email, password })
export const firebaseAuth = (firebaseToken) => api.post('/auth/firebase', { firebaseToken })
export const getMe = () => api.get('/auth/me')
export const updateProfile = (data) => api.put('/auth/profile', data)