import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { createMockDb } from './mockdb.js';

let initialized = false;
let mockDb = null;

export function initializeFirebaseAdmin() {
  if (initialized) return;

  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';

  if (process.env.USE_MOCK_DB === 'true') {
    mockDb = createMockDb();
  } else if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
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
  return mockDb || admin.firestore();
}

export function getMessaging() {
  return admin.messaging();
}

