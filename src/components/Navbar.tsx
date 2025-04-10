'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const navLinks = [
  { href: '/browse/items', label: 'Browse' },
  { href: '/items/new', label: 'Post' },
  { href: '/browse/requests', label: 'Requests' },
  { href: '/chat', label: 'Chat' },
]

export default function Navbar() {
  const [showSearch, setShowSearch] = useState(false)
  const [searchType, setSearchType] = useState<'items' | 'requests'>('items')
  const [query, setQuery] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkUser()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/browse/${searchType}?q=${encodeURIComponent(query.trim())}`)
    setShowSearch(false)
    setQuery('')
  }

  return (
    <nav className="w-full bg-white border-b border-subtext text-primary px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link href="/" className="text-2xl font-bold italic text-primary">
        Thriftee
      </Link>
      <div className="flex items-center gap-4 text-sm font-medium">
      <button
          onClick={() => setShowSearch(!showSearch)}
          className="text-subtext hover:text-accent transition"
        >
          <Search size={20} />
        </button>

        {showSearch && (
          <form
            onSubmit={handleSearch}
            className="relative ml-2"
          >
            <div className="flex items-center bg-white border border-subtext rounded-full shadow-sm -ml-4 pl-4 pr-2 py-1 transition-all w-[43vh]">
              <input
                type="text"
                placeholder={`Search ${searchType}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow text-sm bg-transparent outline-none text-text placeholder-subtext"
              />
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'items' | 'requests')}
                className="text-sm bg-transparent text-right outline-none"
              >
                <option value="items">Items</option>
                <option value="requests">Requests</option>
              </select>
            </div>
          </form>
        )}
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="text-subtext hover:text-accent transition duration-300">
            {link.label}
          </Link>
        ))}
        <Link
          href={isLoggedIn ? '/profile' : '/auth'}
          className="text-subtext hover:text-accent transition duration-300"
        >
          {isLoggedIn ? 'Profile' : 'Login'}
        </Link>
      </div>
    </nav>
  )
}
