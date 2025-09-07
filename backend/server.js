import express from 'express';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { JSONFilePreset } from 'lowdb/node';

dotenv.config();

const app = express();
// CORS with custom header support
app.use(cors({
  origin: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','x-admin-key'],
}));
// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
const PORT = process.env.PORT || 5179;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'changeme-admin';

// Static hosting for website and admin panel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const websiteDir = path.join(__dirname, '..', 'website');
const adminDir = path.join(__dirname, '..', 'admin-panel');
const uploadDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'db.json');
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Lowdb JSON persistence
const defaultData = { pending: [], students: [], lessons: [], announcements: [] };
const dbStore = await JSONFilePreset(dbPath, defaultData);
const db = dbStore.data;
async function persist(){ await dbStore.write(); }

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

// Admin auth middleware
app.use('/api/admin', (req, res, next) => {
  try{
    const key = req.header('x-admin-key');
    if (!key || key !== ADMIN_SECRET) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  }catch(e){
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

// Rate limiting
app.use('/api/', rateLimit({ windowMs: 60 * 1000, max: 120 }));
app.use('/api/admin/', rateLimit({ windowMs: 60 * 1000, max: 60 }));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
    counts: {
      pending: db.pending.length,
      students: db.students.length,
      lessons: db.lessons.length,
      announcements: db.announcements.length,
    }
  });
});

// Enhanced student registration with validation
app.post('/api/register', upload.single('nationalId'), async (req, res) => {
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
    await persist();
    
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
app.post('/api/login', async (req, res) => {
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
    await persist();
    
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
app.post('/api/admin/approve/:id', async (req,res)=>{
  const id = req.params.id;
  const i = db.pending.findIndex(x=>x.id===id);
  if(i===-1) return res.status(404).json({message:'Not found'});
  const st = db.pending.splice(i,1)[0];
  st.status = 'Approved';
  db.students.push(st);
  await persist();
  res.json({ok:true});
});
app.post('/api/admin/reject/:id', async (req,res)=>{
  const id = req.params.id;
  const i = db.pending.findIndex(x=>x.id===id);
  if(i===-1) return res.status(404).json({message:'Not found'});
  db.pending.splice(i,1);
  await persist();
  res.json({ok:true, message:'Your registration is incomplete, please update your information.'});
});

// List approved students (for admin UI)
app.get('/api/admin/students', (req, res) => {
  res.json(db.students);
});

// Set or change a student's passcode (admin)
app.post('/api/admin/set-passcode/:id', async (req, res) => {
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
    await persist();
    res.json({ ok: true });
  } catch (e) {
    console.error('Set passcode error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enhanced lessons/schedules API
app.get('/api/schedules', (req, res) => {
  try {
    // Optional filtering and pagination
    const { center, from, to, page = 1, limit = 50 } = req.query;
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, Math.min(200, parseInt(limit)));

    let lessons = [...db.lessons];
    if (center) lessons = lessons.filter(x => (x.center||'').toLowerCase() === String(center).toLowerCase());
    if (from) lessons = lessons.filter(x => new Date(`${x.date} ${x.time}`) >= new Date(from));
    if (to) lessons = lessons.filter(x => new Date(`${x.date} ${x.time}`) <= new Date(to));

    // Sort lessons by date and time
    const sortedLessons = lessons.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB;
    });
    const start = (p - 1) * l;
    const paged = sortedLessons.slice(start, start + l);
    // Backward-compatible: return array unless pagination is explicitly requested
    if (req.query.page || req.query.limit || req.query.paginate === '1') {
      res.json({ total: sortedLessons.length, page: p, limit: l, items: paged });
    } else {
      res.json(sortedLessons);
    }
  } catch (error) {
    console.error('Schedules fetch error:', error);
    res.status(500).json({ message: 'خطأ في تحميل الجداول' });
  }
});

app.post('/api/admin/lessons', async (req, res) => {
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
    await persist();
    res.json(lesson);
    
  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(500).json({ message: 'خطأ في إضافة الدرس' });
  }
});

// Enhanced announcements API
app.get('/api/announcements', (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, Math.min(200, parseInt(limit)));

    let list = [...db.announcements];
    if (type) list = list.filter(x => (x.type||'').toLowerCase() === String(type).toLowerCase());
    // Sort announcements by date (newest first)
    const sortedAnnouncements = list.sort((a, b) => new Date(b.date) - new Date(a.date));
    const start = (p - 1) * l;
    const paged = sortedAnnouncements.slice(start, start + l);
    if (req.query.page || req.query.limit || req.query.paginate === '1') {
      res.json({ total: sortedAnnouncements.length, page: p, limit: l, items: paged });
    } else {
      res.json(sortedAnnouncements);
    }
  } catch (error) {
    console.error('Announcements fetch error:', error);
    res.status(500).json({ message: 'خطأ في تحميل الإعلانات' });
  }
});

app.post('/api/admin/announcements', async (req, res) => {
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
    await persist();
    res.json(announcement);
    
  } catch (error) {
    console.error('Add announcement error:', error);
    res.status(500).json({ message: 'خطأ في إضافة الإعلان' });
  }
});

app.listen(PORT, ()=> console.log('Server running on http://localhost:'+PORT));