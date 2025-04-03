'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const LottiePlayer = dynamic(() => import('react-lottie-player'), {
  ssr: false
})

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
  const itemId = searchParams.get('id')
  const [item, setItem] = useState<Item | null>(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [userSince, setUserSince] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [lottieData, setLottieData] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    fetch('/assets/loading.json')
      .then((res) => res.json())
      .then((data) => setLottieData(data))
  }, [])

  useEffect(() => {
    const fetchItem = async () => {
      const { data } = await supabase.from('items').select('*').eq('id', itemId).maybeSingle()
      if (data) {
        setItem(data)
        const created = new Date(data.created_at)
        setCreatedAt(created.toLocaleDateString())

        const { data: userData } = await supabase
          .from('users')
          .select('date_joined')
          .eq('id', data.user_id)
          .maybeSingle()

        if (userData?.date_joined) {
          const joined = new Date(userData.date_joined)
          const months = Math.floor((created.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24 * 30))
          setUserSince(months < 1 ? '<1 month' : `${months} month${months !== 1 ? 's' : ''}`)
        }
      }
      setLoading(false)
    }

    if (itemId) fetchItem()
  }, [itemId])

  const handlePrev = () => {
    setCurrentImage((prev) =>
      item?.images?.length ? (prev - 1 + item.images.length) % item.images.length : 0
    )
  }

  const handleNext = () => {
    setCurrentImage((prev) =>
      item?.images?.length ? (prev + 1) % item.images.length : 0
    )
  }

  const handleSwipe = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchStartX = e.changedTouches[0].clientX
    const handleTouchEnd = (endEvent: TouchEvent) => {
      const touchEndX = endEvent.changedTouches[0].clientX
      const diff = touchStartX - touchEndX
      if (diff > 50) handleNext()
      else if (diff < -50) handlePrev()
      window.removeEventListener('touchend', handleTouchEnd)
    }
    window.addEventListener('touchend', handleTouchEnd)
  }

  if (loading || !item || !lottieData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {lottieData && (
          <LottiePlayer
            loop
            play
            animationData={lottieData}
            style={{ width: 100, height: 100 }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      <div className="max-w-5xl mx-auto bg-surface border border-subtext rounded-xl shadow p-6 flex flex-col md:flex-row gap-6">
      <div
        className="relative w-full md:w-1/2 aspect-square overflow-hidden"
        onTouchStart={handleSwipe}
      >
        {item.images.length > 0 && (
          <>
            <Image
              src={item.images[currentImage]}
              alt="Item"
              fill
              className="object-contain rounded-xl" 
            />
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
            >
              <ArrowRight size={18} />
            </button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
              {item.images.map((_, index) => (
                <span
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImage ? 'bg-primary' : 'bg-gray-400'
                  } transition-all`}
                />
              ))}
            </div>
          </>
        )}
      </div>


        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary mb-2">{item.name}</h1>
            <p className="text-lg text-slate-600 font-medium mb-1">₹{item.price}</p>
            <p className="text-sm text-subtext mt-4 mb-2">
              {item.locality ? `${item.locality}, ` : ''}
              {item.city}
            </p>
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
          <button className="w-full py-2 mt-2 rounded-xl bg-slate-400 text-slate-800 font-medium hover:opacity-90">
            Chat with Seller
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ItemDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading item...</div>}>
      <ItemDetailContent />
    </Suspense>
  )
}






