'use client'

import Link from 'next/link'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/items', label: 'Browse' },
  { href: '/items/new', label: 'Post' },
  { href: '/requests', label: 'Requests' },
  { href: '/chat', label: 'Chat' },
  { href: '/profile', label: 'Profile' },
  { href: '/auth', label: 'Login' },
]

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-subtext text-primary px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link href="/" className="text-2xl font-bold italic text-primary">
        Thriftee
      </Link>
      <div className="flex gap-4 text-sm font-medium">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-subtext hover:text-accent transition"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}