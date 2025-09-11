'use client';

import { useState } from 'react';
import { User, Phone, Users, Calendar, Shield, LogOut, Edit3 } from 'lucide-react';
import { StudentProfile, logout, updateStudentProfile } from '@/lib/api';

interface ProfileCardProps {
  profile: StudentProfile;
  onUpdate: (updated: StudentProfile) => void;
}

export default function ProfileCard({ profile, onUpdate }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    studentPhone: profile.studentPhone,
    parentPhone: profile.parentPhone,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await updateStudentProfile(form);
      onUpdate(updated);
      setIsEditing(false);
    } catch (error) {
      alert('فشل التحديث');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  return (
    <div className="card max-w-md w-full mx-auto">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
          {getInitials(profile.fullName)}
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{profile.fullName}</h2>
        <p className="text-slate-500">{profile.user.email}</p>
        <span
          className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
            profile.approved
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {profile.approved ? 'موافق عليه' : 'بانتظار الموافقة'}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary-500" />
          <div>
            <p className="text-sm text-slate-500">المرحلة</p>
            <p className="font-medium">{profile.stage}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary-500" />
          <div>
            <p className="text-sm text-slate-500">العمر</p>
            <p className="font-medium">{profile.age} سنة</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary-500" />
          <div>
            <p className="text-sm text-slate-500">الرقم القومي</p>
            <p className="font-medium">{profile.nationalId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-primary-500" />
          <div>
            <p className="text-sm text-slate-500">هاتف الطالب</p>
            <p className="font-medium">{profile.studentPhone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-primary-500" />
          <div>
            <p className="text-sm text-slate-500">هاتف ولي الأمر</p>
            <p className="font-medium">{profile.parentPhone}</p>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="mt-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">هاتف الطالب</label>
            <input
              type="tel"
              value={form.studentPhone}
              onChange={(e) => setForm({ ...form, studentPhone: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">هاتف ولي الأمر</label>
            <input
              type="tel"
              value={form.parentPhone}
              onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button onClick={() => setIsEditing(false)} className="btn-secondary flex-1">
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button onClick={() => setIsEditing(true)} className="btn-primary flex-1">
          <Edit3 className="w-4 h-4 inline mr-1" />
          تعديل البيانات
        </button>
        <button onClick={logout} className="btn-secondary flex-1">
          <LogOut className="w-4 h-4 inline mr-1" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
