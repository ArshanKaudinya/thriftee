'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Slider } from '@/components/Slider'
import { Star } from 'lucide-react'
import Image from 'next/image'

export default function BrowsePage() {
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(50000)
  const [minQuality, setMinQuality] = useState(0)
  const [city, setCity] = useState('')
  const [hasReceipt, setHasReceipt] = useState(false)
  const [hasDelivery, setHasDelivery] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  const cities = ['Delhi', 'Mumbai', 'Bangalore']

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('is_sold', false)

      if (data) setItems(data)
    }

    fetchItems()
  }, [])

  const filteredItems = items.filter((item) => {
    return (
      item.price >= minPrice &&
      item.price <= maxPrice &&
      item.quality_rating >= minQuality &&
      (city ? item.city === city : true) &&
      (!hasReceipt || item.has_receipt) &&
      (!hasDelivery || item.has_delivery) &&
      (!isVerified || item.is_verified)
    )
  })

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      <div className="sticky top-16 bg-background z-10 pb-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Browse Items</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-xl bg-slate-400 text-slate-800 text-sm font-medium hover:opacity-90"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="bg-surface border border-subtext rounded-xl p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Min Price: ₹{minPrice}</label>
              <Slider min={0} max={50000} step={100} value={[minPrice]} onValueChange={([val]) => setMinPrice(val)} />
            </div>
            <div>
              <label className="text-sm font-medium">Max Price: ₹{maxPrice}</label>
              <Slider min={0} max={50000} step={100} value={[maxPrice]} onValueChange={([val]) => setMaxPrice(val)} />
            </div>
            <div>
              <label className="text-sm font-medium">Minimum Quality</label>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    onClick={() => setMinQuality(star)}
                    className={`cursor-pointer ${star <= minQuality ? 'fill-yellow-500 text-yellow-500' : 'text-subtext'}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 border border-subtext rounded-xl bg-background text-text mt-1"
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-4 items-center flex-wrap">
              <label className="text-sm font-medium">
                <input type="checkbox" checked={hasReceipt} onChange={() => setHasReceipt(!hasReceipt)} /> Has Receipt
              </label>
              <label className="text-sm font-medium">
                <input type="checkbox" checked={hasDelivery} onChange={() => setHasDelivery(!hasDelivery)} /> Delivery
              </label>
              <label className="text-sm font-medium">
                <input type="checkbox" checked={isVerified} onChange={() => setIsVerified(!isVerified)} /> Verified
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const badges = [
            item.has_receipt && 'Receipt',
            item.has_delivery && 'Delivery',
            item.is_verified && 'Verified'
          ].filter(Boolean)

          return (
            <div
              key={item.id}
              onClick={() => router.push(`/items?id=${item.id}`)}
              className="cursor-pointer border rounded-xl p-4 bg-white shadow flex flex-col justify-between"
            >
              {item.images?.[0] ? (
                <img src={item.images[0]} alt={item.name} className="w-full aspect-video object-cover rounded mb-2" />
              ) : (
                <div className="w-full aspect-video bg-gray-100 rounded mb-2" />
              )}
              <div>
                <div className="text-lg font-semibold truncate">{item.name}</div>
                <div className="text-sm text-subtext">₹{item.price}</div>
                <div className="text-sm mb-2">{item.city}</div>
              </div>
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-3 text-xs text-subtext mt-2">
                  {item.has_receipt && <span className="flex items-center gap-1"><Image src="/assets/check.svg" alt="Check" width={16} height={16} /> Receipt</span>}
                  {item.has_delivery && <span className="flex items-center gap-1"><Image src="/assets/check.svg" alt="Check" width={16} height={16} /> Delivery</span>}
                  {item.is_verified && <span className="flex items-center gap-1"><Image src="/assets/check.svg" alt="Check" width={16} height={16} /> Verified</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}


