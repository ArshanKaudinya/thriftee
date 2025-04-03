'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Star } from 'lucide-react'
import Image from 'next/image'

export default function BrowseRequestsPage() {
  const [minBudget, setMinBudget] = useState(0)
  const [maxBudget, setMaxBudget] = useState(50000)
  const [minQuality, setMinQuality] = useState(0)
  const [city, setCity] = useState('')
  const [needsDelivery, setNeedsDelivery] = useState(false)
  interface Request { id: string; title: string; description?: string; budget: number; city: string; locality?: string; min_quality: number; needs_delivery?: boolean; created_at?: string }
  const [requests, setRequests] = useState<Request[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const cities = ['Delhi', 'Mumbai', 'Bangalore']

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase.from('requests').select('*')
      if (data) setRequests(data)
    }
    fetchRequests()
  }, [])

  const clearFilters = () => {
    setMinBudget(0)
    setMaxBudget(50000)
    setMinQuality(0)
    setCity('')
    setNeedsDelivery(false)
  }

  const filteredRequests = requests.filter((req) => {
    return (
      req.budget >= minBudget &&
      req.budget <= maxBudget &&
      req.min_quality >= minQuality &&
      (city ? req.city === city : true) &&
      (!needsDelivery || req.needs_delivery)
    )
  })

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      <div className="sticky top-16 bg-background z-10 pb-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Browse Requests</h1>
        <div className="flex gap-3">
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm font-medium hover:opacity-90 border border-subtext"
          >
            Clear Filters
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-xl bg-slate-400 text-slate-800 text-sm font-medium hover:opacity-90"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-surface border border-subtext rounded-xl p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Min Budget: ₹{minBudget}</label>
              <input
                type="range"
                min={0}
                max={50000}
                step={100}
                value={minBudget}
                onChange={(e) => setMinBudget(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Budget: ₹{maxBudget}</label>
              <input
                type="range"
                min={0}
                max={50000}
                step={100}
                value={maxBudget}
                onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                className="w-full"
              />
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
            <label className="text-sm font-medium flex items-center gap-2">
              <input type="checkbox" checked={needsDelivery} onChange={() => setNeedsDelivery(!needsDelivery)} /> Delivery Needed
            </label>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredRequests.map((req) => (
          <div
            key={req.id}
            className="border rounded-xl p-4 bg-white shadow flex flex-col justify-between min-h-[200px]"
          >
            <div className="text-lg font-semibold truncate mb-1">{req.title}</div>
            {req.description && (
              <div className="text-sm text-text mb-4 max-h-32 overflow-hidden text-ellipsis">
                {req.description}
              </div>
            )}
            <div className="mt-auto pt-2 flex flex-col gap-2 text-sm text-subtext">
              <div className="flex justify-between">
                <span>Budget: ₹{req.budget}</span>
                <span>City: {req.locality ? `${req.locality}, ` : ''}{req.city}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(req.min_quality)].map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />
                  ))}
                  <span className="ml-1">Minimum Quality</span>
                </div>
                {req.needs_delivery && (               
                <div className="flex items-center gap-1 text-xs">
                <Image src="/assets/check.svg" alt="check" width={16} height={16} /> Needs Delivery
                </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}





