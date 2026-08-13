const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');

function loadServiceAccount() {
  const serviceAccountPath = path.join(__dirname, 'service-account.json');
  if (process.env.FIREBASE_SERVICE_ACCOUNT) return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (fs.existsSync(serviceAccountPath)) return JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  return null;
}

function getFirebaseAuth() {
  try {
    if (!getApps().length) {
      const serviceAccount = loadServiceAccount();
      if (!serviceAccount) return null;
      initializeApp({ credential: cert(serviceAccount) });
    }
    return getAuth();
  } catch (error) {
    console.error('Firebase Admin could not initialize:', error.code || error.message);
    return null;
  }
}

async function verifyFirebaseIdToken(idToken) {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) throw new Error('Firebase Admin is not configured');
  return firebaseAuth.verifyIdToken(idToken);
}

module.exports = { verifyFirebaseIdToken, getFirebaseAuth };
