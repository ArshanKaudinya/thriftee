'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ClipLoader } from 'react-spinners'
import { Toaster } from 'sonner'
import ChatItem from './chatItem'
import { ChatRoom } from './types'

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [chats, setChats] = useState<ChatRoom[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchUserAndChats = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/auth')
        return
      }
      setUserId(user.id)

      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)

      if (chatError) {
        console.error('Error fetching chats:', chatError)
        return
      }

      setChats(chatData || [])
      setLoading(false)
    }

    fetchUserAndChats()
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
      <div className="flex flex-col gap-4">
        {chats.map((chat) => (
          <ChatItem key={chat.id} chat={chat} currentUserId={userId!} />
        ))}
      </div>
    </div>
  )
}


