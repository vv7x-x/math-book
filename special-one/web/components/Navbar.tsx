'use client'

import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-primary-700 dark:text-primary-500">
          أحمد سامي - سبشيال وان
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/(student)/dashboard" className="hover:underline">لوحة الطالب</Link>
          <Link href="/(student)/profile" className="hover:underline">الملف الشخصي</Link>
          <Link href="/(admin)/students" className="hover:underline">لوحة الإدارة</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
