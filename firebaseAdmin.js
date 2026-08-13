const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function getFirebaseAdmin() {
  if (admin.apps.length) return admin;
  try {
    const serviceAccountPath = path.join(__dirname, 'service-account.json');
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : fs.existsSync(serviceAccountPath)
        ? JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
        : null;
    if (!serviceAccount) return null;
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    return admin;
  } catch (error) {
    console.error('Firebase Admin could not initialize:', error.message);
    return null;
  }
}

async function verifyFirebaseIdToken(idToken) {
  const firebaseAdmin = getFirebaseAdmin();
  if (!firebaseAdmin) throw new Error('Firebase Admin is not configured');
  return firebaseAdmin.auth().verifyIdToken(idToken);
}

module.exports = { verifyFirebaseIdToken };
