'use client'

import { useEffect, useState } from 'react'
import ProfileCard from '@/components/ProfileCard'
import { StudentProfile, fetchStudentProfile } from '@/lib/api'

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!token) {
      window.location.href = '/login'
      return
    }
    fetchStudentProfile()
      .then((res: any) => {
        // API returns { success, data: { student } }
        const student = res.data?.student ?? res
        // Map to StudentProfile shape
        const mapped: StudentProfile = {
          fullName: student.fullName,
          nationalId: student.nationalId,
          studentPhone: student.studentPhone,
          parentPhone: student.parentPhone,
          stage: student.stage,
          age: student.age,
          approved: student.approved,
          user: student.user || { email: '', role: 'student' },
        }
        setProfile(mapped)
      })
      .catch((e) => setError(e.message || 'فشل الجلب'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center text-slate-500">جاري التحميل...</p>
  if (error) return <p className="text-center text-red-600">{error}</p>
  if (!profile) return null

  return (
    <div className="flex items-start justify-center">
      <ProfileCard profile={profile} onUpdate={(u) => setProfile(u)} />
    </div>
  )
}
