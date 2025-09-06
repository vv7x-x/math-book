import express from 'express';
import { getDb } from '../services/firebase.js';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

export const router = express.Router();

const COLLECTIONS = {
  pendingStudents: 'pending_students',
  students: 'students',
  lessons: 'lessons',
  attendance: 'attendance',
  announcements: 'announcements',
  admins: 'admins'
};

// Registration: create pending student
router.post('/register', async (req, res) => {
  try {
    const student = req.body;
    if (!student || !student.fullName || !student.username || !student.nationalId || !student.studentPhone || !student.parentPhone || !student.stage || !student.age || !student.center) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = uuidv4();
    const doc = { ...student, id, status: 'Pending Approval', createdAt: Date.now() };
    await getDb().collection(COLLECTIONS.pendingStudents).doc(id).set(doc);
    return res.json({ success: true, id });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to register' });
  }
});

// Admin: list pending students
router.get('/admin/pending-students', async (req, res) => {
  try {
    const snapshot = await getDb().collection(COLLECTIONS.pendingStudents).get();
    const items = snapshot.docs.map(d => d.data());
    return res.json(items);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch pending' });
  }
});

// Admin: approve
router.post('/admin/approve', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const pendingRef = getDb().collection(COLLECTIONS.pendingStudents).doc(id);
    const pending = await pendingRef.get();
    if (!pending.exists) return res.status(404).json({ error: 'Not found' });
    const student = pending.data();
    student.status = 'Approved';
    await getDb().collection(COLLECTIONS.students).doc(id).set(student);
    await pendingRef.delete();
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to approve' });
  }
});

// Admin: reject
router.post('/admin/reject', async (req, res) => {
  try {
    const { id, message } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    await getDb().collection('rejections').doc(id).set({ id, message: message || 'Your registration is incomplete, please update your information.' });
    await getDb().collection(COLLECTIONS.pendingStudents).doc(id).delete();
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to reject' });
  }
});

// Auth: pseudo login (username only for now)
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Missing username' });
    const snap = await getDb().collection(COLLECTIONS.students).where('username', '==', username).limit(1).get();
    if (snap.empty) return res.status(403).json({ error: 'Not approved yet' });
    const student = snap.docs[0].data();
    return res.json({ success: true, student });
  } catch {
    return res.status(500).json({ error: 'Login failed' });
  }
});

// QR code for student id
router.get('/students/:id/qr', async (req, res) => {
  try {
    const { id } = req.params;
    const dataUrl = await QRCode.toDataURL(id);
    const img = Buffer.from(dataUrl.split(',')[1], 'base64');
    res.setHeader('Content-Type', 'image/png');
    return res.send(img);
  } catch {
    return res.status(500).json({ error: 'QR generation failed' });
  }
});

// Lessons CRUD (simplified)
router.get('/lessons', async (req, res) => {
  try {
    const snapshot = await getDb().collection(COLLECTIONS.lessons).orderBy('date', 'asc').get();
    const items = snapshot.docs.map(d => d.data());
    return res.json(items);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

router.post('/admin/lessons', async (req, res) => {
  try {
    const lesson = req.body;
    const id = uuidv4();
    const doc = { id, ...lesson };
    await getDb().collection(COLLECTIONS.lessons).doc(id).set(doc);
    return res.json({ success: true, id });
  } catch {
    return res.status(500).json({ error: 'Failed to add lesson' });
  }
});

router.put('/admin/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await getDb().collection(COLLECTIONS.lessons).doc(id).update(req.body);
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to update lesson' });
  }
});

router.delete('/admin/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await getDb().collection(COLLECTIONS.lessons).doc(id).delete();
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// Announcements
router.get('/announcements', async (req, res) => {
  try {
    const snapshot = await getDb().collection(COLLECTIONS.announcements).orderBy('createdAt', 'desc').get();
    const items = snapshot.docs.map(d => d.data());
    return res.json(items);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

router.post('/admin/announcements', async (req, res) => {
  try {
    const id = uuidv4();
    const doc = { id, ...req.body, createdAt: Date.now() };
    await getDb().collection(COLLECTIONS.announcements).doc(id).set(doc);
    return res.json({ success: true, id });
  } catch {
    return res.status(500).json({ error: 'Failed to post announcement' });
  }
});

// Attendance record
router.post('/attendance', async (req, res) => {
  try {
    const { studentId, lessonId, status } = req.body;
    if (!studentId || !lessonId) return res.status(400).json({ error: 'Missing fields' });
    const id = uuidv4();
    const doc = { id, studentId, lessonId, date: Date.now(), status: status || 'Present' };
    await getDb().collection(COLLECTIONS.attendance).doc(id).set(doc);
    return res.json({ success: true, id });
  } catch {
    return res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

