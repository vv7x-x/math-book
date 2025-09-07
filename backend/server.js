import express from 'express';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';

// In-memory store (replace with Firebase later)
const db = {
  pending: [],
  students: [],
  lessons: [],
  announcements: [],
};

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5179;

// Static hosting for website and admin panel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const websiteDir = path.join(__dirname, '..', 'website');
const adminDir = path.join(__dirname, '..', 'admin-panel');
const uploadDir = path.join(__dirname, 'uploads');
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer setup for ID image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `id_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

app.use('/', express.static(websiteDir));
app.use('/admin', express.static(adminDir));
app.use('/uploads', express.static(uploadDir));

// Enhanced student registration with validation
app.post('/api/register', upload.single('nationalId'), (req, res) => {
  try {
    const { fullName, username, studentPhone, parentPhone, stage, center, passcode } = req.body;
    const file = req.file;

    // Validation
    if (!fullName || fullName.trim().length < 5) {
      return res.status(400).json({ message: 'الاسم الكامل يجب أن يكون 5 أحرف على الأقل' });
    }
    
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' });
    }
    
    // Check if username already exists
    const existingUser = [...db.pending, ...db.students].find(s => s.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'اسم المستخدم موجود بالفعل' });
    }
    
    if (!file) {
      return res.status(400).json({ message: 'يرجى رفع صورة الرقم القومي أو شهادة الميلاد' });
    }

    // Passcode validation (4-8 digits recommended)
    if (!passcode || String(passcode).trim().length < 4) {
      return res.status(400).json({ message: 'يرجى إدخال رقم سرّي مكوّن من 4 أرقام على الأقل' });
    }
    const sanitizedPass = String(passcode).trim();
    const passcodeHash = crypto.createHash('sha256').update(sanitizedPass).digest('hex');

    const student = {
      id: uuid(),
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      studentPhone: studentPhone?.trim() || '',
      parentPhone: parentPhone?.trim() || '',
      stage: stage?.trim() || '',
      center: center?.trim() || '',
      nationalIdUrl: `/uploads/${file.filename}`,
      passcodeHash,
      status: 'Pending Approval',
      createdAt: new Date().toISOString()
    };

    db.pending.push(student);
    
    res.json({
      ok: true,
      id: student.id,
      message: 'تم إرسال التسجيل بنجاح! ستحصل على رسالة تأكيد قريباً.'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Enhanced student login with validation (username + passcode)
app.post('/api/login', (req, res) => {
  try {
    const { username, passcode } = req.body;
    if (!username || !passcode) {
      return res.status(400).json({ message: 'يرجى إدخال اسم المستخدم والرقم السرّي' });
    }

    const student = db.students.find(s => 
      s.username === username.trim().toLowerCase() && 
      s.status === 'Approved'
    );
    
    if (!student) {
      return res.status(401).json({ 
        message: 'لم يتم العثور على الحساب أو لم تتم الموافقة بعد.' 
      });
    }
    // Compare passcode
    const candHash = crypto.createHash('sha256').update(String(passcode).trim()).digest('hex');
    if (student.passcodeHash !== candHash) {
      return res.status(401).json({ message: 'الرقم السرّي غير صحيح' });
    }
    
    // Generate token and update last login
    const token = uuid();
    student.lastLogin = new Date().toISOString();
    
    res.json({ 
      token, 
      student: {
        id: student.id,
        fullName: student.fullName,
        username: student.username,
        stage: student.stage,
        center: student.center,
        status: student.status
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Admin basics (no real auth for demo)
app.get('/api/admin/pending', (req,res)=>{ res.json(db.pending); });
app.post('/api/admin/approve/:id', (req,res)=>{
  const id = req.params.id;
  const i = db.pending.findIndex(x=>x.id===id);
  if(i===-1) return res.status(404).json({message:'Not found'});
  const st = db.pending.splice(i,1)[0];
  st.status = 'Approved';
  db.students.push(st);
  res.json({ok:true});
});
app.post('/api/admin/reject/:id', (req,res)=>{
  const id = req.params.id;
  const i = db.pending.findIndex(x=>x.id===id);
  if(i===-1) return res.status(404).json({message:'Not found'});
  db.pending.splice(i,1);
  res.json({ok:true, message:'Your registration is incomplete, please update your information.'});
});

// List approved students (for admin UI)
app.get('/api/admin/students', (req, res) => {
  res.json(db.students);
});

// Set or change a student's passcode (admin)
app.post('/api/admin/set-passcode/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { passcode } = req.body || {};
    if (!passcode || String(passcode).trim().length < 4) {
      return res.status(400).json({ message: 'يرجى إدخال رقم سرّي 4 أرقام على الأقل' });
    }
    const hash = crypto.createHash('sha256').update(String(passcode).trim()).digest('hex');

    let target = db.students.find(s => s.id === id);
    if (!target) {
      // allow setting for pending as well (pre-approval)
      target = db.pending.find(s => s.id === id);
    }
    if (!target) return res.status(404).json({ message: 'Student not found' });

    target.passcodeHash = hash;
    res.json({ ok: true });
  } catch (e) {
    console.error('Set passcode error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enhanced lessons/schedules API
app.get('/api/schedules', (req, res) => {
  try {
    // Sort lessons by date and time
    const sortedLessons = db.lessons.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB;
    });
    res.json(sortedLessons);
  } catch (error) {
    console.error('Schedules fetch error:', error);
    res.status(500).json({ message: 'خطأ في تحميل الجداول' });
  }
});

app.post('/api/admin/lessons', (req, res) => {
  try {
    const { subject, date, time, center, teacher, duration } = req.body;
    
    if (!subject || !date || !time || !center) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }
    
    const lesson = {
      id: uuid(),
      subject: subject.trim(),
      date: date.trim(),
      time: time.trim(),
      center: center.trim(),
      teacher: teacher?.trim() || 'أحمد سامي',
      duration: duration?.trim() || '2 ساعة',
      createdAt: new Date().toISOString()
    };
    
    db.lessons.push(lesson);
    res.json(lesson);
    
  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(500).json({ message: 'خطأ في إضافة الدرس' });
  }
});

// Enhanced announcements API
app.get('/api/announcements', (req, res) => {
  try {
    // Sort announcements by date (newest first)
    const sortedAnnouncements = db.announcements.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    res.json(sortedAnnouncements);
  } catch (error) {
    console.error('Announcements fetch error:', error);
    res.status(500).json({ message: 'خطأ في تحميل الإعلانات' });
  }
});

app.post('/api/admin/announcements', (req, res) => {
  try {
    const { text, title, type, important } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'نص الإعلان مطلوب' });
    }
    
    const announcement = {
      id: uuid(),
      title: title?.trim() || 'إعلان',
      text: text.trim(),
      type: type?.trim() || 'general',
      important: Boolean(important),
      date: new Date().toISOString(),
      author: 'أحمد سامي'
    };
    
    db.announcements.push(announcement);
    res.json(announcement);
    
  } catch (error) {
    console.error('Add announcement error:', error);
    res.status(500).json({ message: 'خطأ في إضافة الإعلان' });
  }
});

app.listen(PORT, ()=> console.log('Server running on http://localhost:'+PORT));