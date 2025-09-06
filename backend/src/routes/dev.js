import express from 'express';
import { getDb } from '../services/firebase.js';

export const devRouter = express.Router();

devRouter.post('/seed', async (req, res) => {
  try {
    const db = getDb();
    await db.collection('admins').doc('admin1').set({ id: 'admin1', username: 'admin', password: 'admin', role: 'admin' });
    await db.collection('centers').doc('c1').set({ id: 'c1', name: 'Center A' });
    await db.collection('lessons').doc('l1').set({ id: 'l1', subject: 'رياضيات', date: Date.now() + 86400000, center: 'Center A' });
    await db.collection('announcements').doc('a1').set({ id: 'a1', title: 'ترحيب', message: 'أهلاً بكم', createdAt: Date.now() });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: 'seed failed' });
  }
});

