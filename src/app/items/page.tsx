'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { ClipLoader } from 'react-spinners'
import { toast } from 'sonner'

interface Item {
  id: string
  name: string
  price: number
  description: string
  city: string
  locality?: string
  quality_rating: number
  has_receipt: boolean
  has_delivery: boolean
  is_verified: boolean
  created_at: string
  user_id: string
  images: string[]
}

function ItemDetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const itemId = searchParams.get('id')
  const [item, setItem] = useState<Item | null>(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [userSince, setUserSince] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) return
      console.log('[fetchItem] Fetching item with id:', itemId)
      const { data, error } = await supabase.from('items').select('*').eq('id', itemId).maybeSingle()
      if (error) console.error('[fetchItem] Error fetching item:', error)
      if (data) {
        console.log('[fetchItem] Item data:', data)
        setItem(data)
        const created = new Date(data.created_at)
        setCreatedAt(created.toLocaleDateString())
        const { data: userData, error: userError } = await supabase.from('users').select('date_joined').eq('id', data.user_id).maybeSingle()
        if (userError) console.error('[fetchItem] Error fetching user data:', userError)
        if (userData?.date_joined) {
          const joined = new Date(userData.date_joined)
          const now = new Date()
          const months = Math.floor((now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24 * 30))
          setUserSince(months < 1 ? '<1 month' : `${months} month${months !== 1 ? 's' : ''}`)
        }
      }
      setLoading(false)
      console.log('[fetchItem] Finished fetching item')
    }
    if (itemId) fetchItem()
  }, [itemId])

  const handlePrev = () => {
    setCurrentImage(prev =>
      item?.images?.length ? (prev - 1 + item.images.length) % item.images.length : 0
    )
    console.log('[handlePrev] Current image index:', currentImage)
  }

  const handleNext = () => {
    setCurrentImage(prev =>
      item?.images?.length ? (prev + 1) % item.images.length : 0
    )
    console.log('[handleNext] Current image index:', currentImage)
  }

  const handleSwipe = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchStartX = e.changedTouches[0].clientX
    const handleTouchEnd = (endEvent: TouchEvent) => {
      const touchEndX = endEvent.changedTouches[0].clientX
      const diff = touchStartX - touchEndX
      if (diff > 50) handleNext()
      else if (diff < -50) handlePrev()
      window.removeEventListener('touchend', handleTouchEnd)
      console.log('[handleSwipe] Swipe diff:', diff)
    }
    window.addEventListener('touchend', handleTouchEnd)
  }

  const startChat = async () => {
    if (!item) return
    console.log('[startChat] Starting chat for item:', item.id)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('[startChat] User error:', userError)
        toast.error('You must be logged in to chat')
        return
      }
      console.log('[startChat] Logged in user:', user)
      if (item.user_id === user.id) {
        console.error('[startChat] User is seller')
        toast.error("You cannot chat with yourself")
        return
      }
      const { data: existingChat, error: existingChatError } = await supabase
        .from('chats')
        .select('*')
        .eq('item_id', item.id)
        .eq('buyer_id', user.id)
        .eq('seller_id', item.user_id)
        .maybeSingle()
      if (existingChatError) console.error('[startChat] Existing chat error:', existingChatError)
      if (existingChat) {
        console.log('[startChat] Existing chat found:', existingChat)
        router.push(`/chat/chatRoom?id=${existingChat.id}`)
        return
      }
      console.log('[startChat] No existing chat found, creating new chat')
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          item_id: item.id,
          seller_id: item.user_id,
          buyer_id: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .maybeSingle()
      if (error || !newChat) {
        console.error('[startChat] Error creating chat:', error)
        toast.error('Failed to start chat')
        return
      }
      console.log('[startChat] New chat created:', newChat)
      toast.success('Chat started')
      router.push(`/chat/chatRoom?id=${newChat.id}`)
    } catch (err) {
      console.error('[startChat] Unexpected error:', err)
      toast.error('Something went wrong')
    }
  }

  if (loading || !item) {
    console.log('[render] Loading or no item found')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ClipLoader color="#64748b" size={50} />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      <div className="max-w-5xl mx-auto bg-surface border border-subtext rounded-xl shadow p-6 flex flex-col md:flex-row gap-6">
        <div className="relative w-full md:w-1/2 aspect-square overflow-hidden" onTouchStart={handleSwipe}>
          {item.images.length > 0 && (
            <>
              <Image src={item.images[currentImage]} alt="Item" fill className="object-contain rounded-xl" />
              <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow">
                <ArrowLeft size={18} />
              </button>
              <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow">
                <ArrowRight size={18} />
              </button>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                {item.images.map((_, index) => (
                  <span key={index} className={`w-2 h-2 rounded-full ${index === currentImage ? 'bg-primary' : 'bg-gray-400'} transition-all`} />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary mb-2">{item.name}</h1>
            <p className="text-lg text-slate-600 font-medium mb-1">₹{item.price}</p>
            <p className="text-sm text-subtext mt-4 mb-2">{item.locality ? `${item.locality}, ` : ''}{item.city}</p>
            <p className="text-sm mb-2">{item.description}</p>
            <div className="flex flex-col gap-2 text-sm text-subtext mt-6 mb-6">
              {item.quality_rating > 0 && <span>⭐ {item.quality_rating}/5</span>}
              {item.has_receipt && (
                <span className="flex items-center gap-1">
                  <Image src="/assets/check.svg" alt="Check" width={16} height={16} /> Receipt
                </span>
              )}
              {item.has_delivery && (
                <span className="flex items-center gap-1">
                  <Image src="/assets/check.svg" alt="Check" width={16} height={16} /> Delivery
                </span>
              )}
              {item.is_verified && (
                <span className="flex items-center gap-1">
                  <Image src="/assets/check.svg" alt="Check" width={16} height={16} /> Verified Poster
                </span>
              )}
            </div>
            <p className="text-sm text-subtext mb-2">Posted on: {createdAt}</p>
            {userSince && <p className="text-sm text-subtext mb-2">Seller since: {userSince}</p>}
          </div>
          <button onClick={startChat} className="w-full py-2 mt-2 rounded-xl bg-slate-400 text-slate-800 font-medium hover:opacity-90">
            Chat with Seller
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ItemDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><ClipLoader color="#64748b" size={50} /></div>}>
      <ItemDetailContent />
    </Suspense>
  )
}










