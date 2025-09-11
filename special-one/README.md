# Special One (سبشيال وان)

Mono-repo لمشروع تعليمي لمعلم رياضيات، مصمم بهيكلية قابلة للتوسع وصيانة سهلة.

## الهيكل العام
- `backend/` — Node.js + Express + MongoDB + JWT + RBAC + أمان
- `web/` — Next.js 14 (App Router) + Tailwind (لوحة الطالب، صفحة Profile جاهزة)
- `mobile/` — (Placeholder للتطبيق المحمول لاحقًا)
- `docs/` — وثائق الهندسة والـ APIs والأمان والتشغيل
- `assets/` — أصول مشتركة (صور/أيقونات/خطوط)
- `archive/` — نقل أي ملفات/مجلدات غير مستخدمة بدل حذفها

## التشغيل المحلي

### Backend
1) أنشئ ملف `.env` داخل `backend/` بناءً على `.env.example`.
2) ثبّت الاعتمادات:
   - داخل مجلّد `backend/`: `npm install`
3) شغّل السيرفر:
   - `npm run dev`
4) نقطة الصحة: `GET http://localhost:4000/health`

### Web
1) من `web/`: `npm install`
2) أنشئ `web/.env.local` (اختياري) وضع:
   - `NEXT_PUBLIC_API_URL=http://localhost:4000`
3) شغّل الواجهة: `npm run dev`
4) صفحة ملف الطالب: `http://localhost:3000/(student)/profile`

## بيئة العمل
- قاعدة البيانات: MongoDB (محليًا أو MongoDB Atlas)
- الإشعارات: Firebase Cloud Messaging (لاحقًا)
- الاستضافة: Render (Backend) + Vercel (Web) + Firebase (Mobile)

## تفاصيل مجلدات backend
- `backend/src/models/` — نماذج Mongoose.
- `backend/src/routes/` — تعريف REST APIs.
- `backend/src/middleware/` — المصادقة والأمان.
- `backend/src/config/` — الاتصال بقاعدة البيانات.
- `backend/src/utils/` — أدوات مساعدة (QR، الاستجابات القياسية، ...).

## ميزات backend الأساسية
- تسجيل/دخول JWT + Refresh Tokens.
- أدوار وصلاحيات: student, moderator, admin.
- إدارة الطلاب، الحضور بالـ QR، الجداول، الإعلانات، المدفوعات.
- Validation شامل + حمايات (helmet, rate-limit, xss-clean, mongo-sanitize, cors).

## Best Practices (مختصر)
- مصادقة JWT مع Refresh + إبطال tokens عبر `tokenVersion`.
- Middlewares أمان: `helmet`, `hpp`, `xss-clean`, `rate-limit`, `mongo-sanitize`, `cors`.
- فصل المكونات والطبقات، واعتماد استجابات موحدة.
- تسجيل وحفظ الأسرار في ملفات بيئة وعدم رفعها للمستودع.

راجع `docs/` لمزيد من التفاصيل.
