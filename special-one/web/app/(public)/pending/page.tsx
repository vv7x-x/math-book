'use client'

import Link from 'next/link'

export default function PendingApprovalPage() {
  return (
    <div className="max-w-lg mx-auto mt-10 card text-center">
      <h1 className="text-2xl font-bold mb-2">بانتظار الموافقة</h1>
      <p className="text-slate-600 mb-4">تم استلام طلب التسجيل الخاص بك. سيتم إشعارك عند القبول.</p>
      <div className="space-x-2 space-x-reverse">
        <Link href="/(public)/login" className="btn-secondary inline-block">تسجيل الدخول</Link>
        <Link href="/(public)/register" className="btn-primary inline-block">تعديل/إعادة التسجيل</Link>
      </div>
    </div>
  )
}
