'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ChatList from './chatList'
import { Toaster } from 'sonner'
import { ClipLoader } from 'react-spinners'

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error || !data.user) {
          router.push('/auth')
        } else {
          setUserId(data.user.id)
        }
      } catch (err) {
        console.error('Error fetching user:', err)
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ClipLoader size={40} color="#36d7b7" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      <Toaster richColors position="top-right" />
      <h1 className="text-2xl font-bold text-primary mb-6">Your Chats</h1>
      {userId && <ChatList userId={userId} />}
    </div>
  )
}

