const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5179;

const db = { pending: [], students: [], lessons: [], announcements: [] };
const genId = () => Math.random().toString(36).slice(2)+Date.now().toString(36);

const websiteDir = path.join(__dirname, '..', 'website');
const adminDir = path.join(__dirname, '..', 'admin-panel');

const mime = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'application/javascript; charset=utf-8',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.ico':'image/x-icon', '.json':'application/json; charset=utf-8'
};

function send(res, code, body, headers={}){
  res.writeHead(code, { 'Content-Type':'text/plain; charset=utf-8', 'Access-Control-Allow-Origin':'*', ...headers });
  res.end(body);
}
function sendJSON(res, obj){
  const body = Buffer.from(JSON.stringify(obj));
  res.writeHead(200, { 'Content-Type':'application/json; charset=utf-8', 'Access-Control-Allow-Origin':'*' });
  res.end(body);
}

function serveStatic(res, filePath){
  fs.stat(filePath, (err, stat)=>{
    if(err || !stat.isFile()){ send(res, 404, 'Not Found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Access-Control-Allow-Origin':'*' });
    fs.createReadStream(filePath).pipe(res);
  });
}

function parseBody(req){
  return new Promise((resolve)=>{
    let data='';
    req.on('data', chunk=>{ data+=chunk; if(data.length>1e6) req.connection.destroy(); });
    req.on('end', ()=>{
      try{ resolve(JSON.parse(data||'{}')); } catch(e){ resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res)=>{
  const parsed = url.parse(req.url, true);
  const method = req.method || 'GET';
  const p = decodeURI(parsed.pathname||'/');

  // CORS preflight
  if(method==='OPTIONS'){
    res.writeHead(204, {
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Methods':'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type'
    });
    return res.end();
  }

  // API routes
  if(p==='/api/register' && method==='POST'){
    const body = await parseBody(req);
    const s = { id: genId(), ...body, status:'Pending Approval' };
    db.pending.push(s);
    return sendJSON(res, { ok:true, id:s.id });
  }
  if(p==='/api/login' && method==='POST'){
    const body = await parseBody(req);
    const st = db.students.find(x=>x.username===body.username && x.nationalId===body.nationalId);
    if(!st) return send(res, 401, JSON.stringify({message:'Not approved or not found'}), {'Content-Type':'application/json; charset=utf-8'});
    return sendJSON(res, { token: genId(), student: st });
  }
  if(p==='/api/admin/pending' && method==='GET') return sendJSON(res, db.pending);
  if(p.startsWith('/api/admin/approve/') && method==='POST'){
    const id = p.split('/').pop();
    const i = db.pending.findIndex(x=>x.id===id);
    if(i===-1) return send(res, 404, JSON.stringify({message:'Not found'}), {'Content-Type':'application/json; charset=utf-8'});
    const st = db.pending.splice(i,1)[0]; st.status='Approved'; db.students.push(st);
    return sendJSON(res, {ok:true});
  }
  if(p.startsWith('/api/admin/reject/') && method==='POST'){
    const id = p.split('/').pop();
    const i = db.pending.findIndex(x=>x.id===id);
    if(i===-1) return send(res, 404, JSON.stringify({message:'Not found'}), {'Content-Type':'application/json; charset=utf-8'});
    db.pending.splice(i,1);
    return sendJSON(res, {ok:true, message:'Your registration is incomplete, please update your information.'});
  }
  if(p==='/api/schedules' && method==='GET') return sendJSON(res, db.lessons);
  if(p==='/api/admin/lessons' && method==='POST'){
    const body = await parseBody(req); const l={ id: genId(), ...body }; db.lessons.push(l); return sendJSON(res, l);
  }
  if(p==='/api/announcements' && method==='GET') return sendJSON(res, db.announcements);
  if(p==='/api/admin/announcements' && method==='POST'){
    const body = await parseBody(req); const a = { id: genId(), text: body.text, date: new Date().toISOString() }; db.announcements.push(a); return sendJSON(res, a);
  }

  // Static: admin panel
  if(p==='/admin' || p==='/admin/') return serveStatic(res, path.join(adminDir, 'index.html'));
  if(p.startsWith('/admin/')){
    const fp = path.join(adminDir, p.replace('/admin/',''));
    return serveStatic(res, fp);
  }

  // Static: website
  let staticPath = path.join(websiteDir, p==='/' ? 'index.html' : p.replace(/^\/+/, ''));
  // Prevent path traversal
  if(!staticPath.startsWith(websiteDir)) staticPath = path.join(websiteDir, 'index.html');
  return serveStatic(res, staticPath);
});

server.listen(PORT, ()=>{
  console.log(`Server running on http://localhost:${PORT}/`);
});