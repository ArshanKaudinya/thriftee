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
  const [itemName, setItemName] = useState<string>('Loading item...')

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.rpc('get_userinfo_by_id', { uid: otherUserId })
      if (error || !data || data.length === 0) {
        console.error('Error fetching user info:', error)
        return
      }
      setOtherUserName(data[0].name)
    }

    fetchUser()
  }, [otherUserId])

  useEffect(() => {
    const fetchItem = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('name')
        .eq('id', chat.item_id)
        .single()

      if (error) {
        console.error('Error fetching item name:', error)
        return
      }

      if (data) {
        setItemName(data.name)
      }
    }

    fetchItem()
  }, [chat.item_id])

  const handleClick = () => router.push(`/chat/chatRoom?id=${chat.id}`)

  return (
    <div onClick={handleClick} className="p-4 rounded-xl shadow bg-white hover:bg-slate-50 cursor-pointer">
      <div className="font-medium text-primary">Chat with {otherUserName}</div>
      <div className="text-sm text-subtext mt-1">Item: {itemName}</div>
    </div>
  )
}


