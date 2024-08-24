const admin = require("firebase-admin");

// Firebase Admin SDK initialization configuration
const firebaseConfig = {
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
};

// Initialize Firebase Admin SDK
admin.initializeApp(firebaseConfig);

// Export the initialized admin instance
module.exports = admin;
