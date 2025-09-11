'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    nationalId: '',
    studentPhone: '',
    parentPhone: '',
    stage: '',
    age: '',
    center: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/register-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          age: Number(form.age),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'فشل التسجيل')
      setSuccess('تم الإرسال بنجاح. بانتظار الموافقة.')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 card">
      <h1 className="text-2xl font-bold mb-4">تسجيل طالب جديد</h1>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { key: 'fullName', label: 'الاسم الكامل', type: 'text' },
          { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
          { key: 'password', label: 'كلمة المرور', type: 'password' },
          { key: 'nationalId', label: 'الرقم القومي', type: 'text' },
          { key: 'studentPhone', label: 'هاتف الطالب', type: 'tel' },
          { key: 'parentPhone', label: 'هاتف ولي الأمر', type: 'tel' },
          { key: 'stage', label: 'المرحلة', type: 'text' },
          { key: 'age', label: 'السن', type: 'number' },
          { key: 'center', label: 'السنتر', type: 'text' },
        ].map((f) => (
          <div key={f.key} className="col-span-1">
            <label className="block text-sm font-medium mb-1">{f.label}</label>
            <input
              type={f.type}
              value={(form as any)[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        ))}
        {error && <p className="text-red-600 text-sm col-span-2">{error}</p>}
        {success && <p className="text-green-600 text-sm col-span-2">{success}</p>}
        <div className="col-span-2">
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'جاري الإرسال...' : 'تسجيل'}
          </button>
        </div>
      </form>
      <p className="text-sm mt-3">لديك حساب؟ <Link className="text-primary-600" href="/(public)/login">تسجيل الدخول</Link></p>
      <p className="text-sm mt-1">بعد التسجيل، راقب صفحة <Link className="text-primary-600" href="/(public)/pending">بانتظار الموافقة</Link></p>
    </div>
  )
}
