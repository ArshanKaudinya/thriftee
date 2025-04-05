'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChatRoom } from './types'
import { supabase } from '@/lib/supabase'

export default function ChatItem({
  chat,
  currentUserId,
}: {
  chat: ChatRoom
  currentUserId: string
}) {
  const router = useRouter()
  const otherUserId = chat.buyer_id === currentUserId ? chat.seller_id : chat.buyer_id
  const [otherUserName, setOtherUserName] = useState<string>('User')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name')
          .eq('id', otherUserId)
          .single()

        if (error) {
          console.error('Error fetching user name:', error)
        } else if (data) {
          setOtherUserName(data.name)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
      }
    }

    fetchUser()
  }, [otherUserId])

  const handleClick = () => router.push(`/chat/chatRoom?id=${chat.id}`)

  return (
    <div onClick={handleClick} className="p-4 rounded-xl shadow bg-white hover:bg-slate-50 cursor-pointer">
      <div className="font-medium text-primary">Chat with {otherUserName}</div>
      <div className="text-sm text-subtext mt-1">Item ID: {chat.item_id}</div>
    </div>
  )
}

