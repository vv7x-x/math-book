import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let initialized = false;

export function initializeFirebaseAdmin() {
  if (initialized) return;

  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';

  if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))),
    });
  } else if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } else {
    admin.initializeApp();
  }

  initialized = true;
}

export function getDb() {
  return admin.firestore();
}

export function getMessaging() {
  return admin.messaging();
}

