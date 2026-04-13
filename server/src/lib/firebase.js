import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, '../../firebase-service-account.json'), 'utf8')
)

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    })
}

export const verifyFirebaseToken = async (token) => {
    return await admin.auth().verifyIdToken(token)
}

export default admin