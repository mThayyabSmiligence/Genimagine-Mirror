const admin = require("firebase-admin");
const serviceAccount = require("./genimagin-73d5c-firebase-adminsdk-fbsvc-4176331e82.json"); // Download this from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin; 
