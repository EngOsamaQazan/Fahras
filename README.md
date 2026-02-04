# Fahras Modern (Node + PostgreSQL)

هذا مجلد النسخة الحديثة للنظام مع فصل الـ API عن واجهة المستخدم.

## المكونات
- Backend: Node + Express + Prisma
- Frontend: React + Vite
- Database: PostgreSQL
- Auth: JWT + RBAC

## التشغيل عبر Docker
```
docker compose up -d --build
```

بعد الإقلاع:
- API: http://localhost:4000/health
- Web: http://localhost:5173

## تهيئة قاعدة البيانات
ادخل إلى حاوية الـ API ونفّذ:
```
docker compose exec api npm run prisma:migrate
docker compose exec api npm run seed
```

بيانات الدخول الافتراضية:
- username: admin
- password: ChangeMe123!

## ضبط المتغيرات
انسخ `backend/env.example` إلى `.env` داخل `backend` وعدّل القيم حسب الحاجة.  
بالنسبة للواجهة الأمامية استخدم `frontend/env.example`.

## ملاحظات للهجرة
- تم الحفاظ على نفس الجداول الأساسية: accounts, clients, attachments, users.
- تم إضافة RBAC مرن عبر جداول roles/permissions لسهولة الإدارة لاحقًا.
- يمكنك لاحقًا نقل بيانات MySQL إلى PostgreSQL عبر سكربت تحويل أو pgloader.

## ربط Supabase
إذا أردت الربط مباشرة بقاعدة بيانات Supabase:
- ضع رابط الاتصال في `backend/.env` ضمن `DATABASE_URL`.
- ضع رابط **Direct connection** في `DIRECT_URL` لعمليات الترحيل (migrate).
- يفضل استخدام **Session pooler** للتشغيل داخل `DATABASE_URL`.
- عند استخدام pooler مع Prisma أضف للـ URL: `?pgbouncer=true&connection_limit=1`.

## رفع المرفقات إلى Supabase Storage
أضف هذه القيم في `backend/.env`:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BUCKET`
- `SUPABASE_STORAGE_PRIVATE=0` (اجعلها 1 إذا كان البكت خاص)
- `SUPABASE_STORAGE_SIGNED_URL_TTL=3600`

ملاحظة: إذا كان البكت خاص، سيتم استخدام روابط موقّعة.
# Fahras
