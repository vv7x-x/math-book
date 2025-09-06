import express from 'express';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';

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

// Student register (multipart: fields + idImage file)
app.post('/api/register', upload.single('idImage'), (req,res)=>{
  const body = req.body || {};
  const file = req.file;
  const s = {
    id: uuid(),
    ...body,
    idImageUrl: file ? `/uploads/${file.filename}` : null,
    status:'Pending Approval'
  };
  db.pending.push(s);
  res.json({ok:true, id:s.id, idImageUrl: s.idImageUrl});
});

// Student login (approved only) - username only for demo
app.post('/api/login', (req,res)=>{
  const { username } = req.body;
  const st = db.students.find(x=>x.username===username);
  if(!st) return res.status(401).json({message:'Not approved or not found'});
  res.json({ token: uuid(), student: st });
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

// Lessons
app.get('/api/schedules', (req,res)=>{ res.json(db.lessons); });
app.post('/api/admin/lessons', (req,res)=>{
  const l = { id: uuid(), ...req.body };
  db.lessons.push(l);
  res.json(l);
});

// Announcements
app.get('/api/announcements', (req,res)=>{ res.json(db.announcements); });
app.post('/api/admin/announcements', (req,res)=>{
  const a = { id: uuid(), text: req.body.text, date: new Date().toISOString() };
  db.announcements.push(a);
  res.json(a);
});

app.listen(PORT, ()=> console.log('Server running on http://localhost:'+PORT));