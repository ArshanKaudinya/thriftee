'use client'

import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import { getLoadingAnimation } from '@/lib/loadingAnimation'

export default function Loading() {
  const [animationData, setAnimationData] = useState<any>(null)

  useEffect(() => {
    getLoadingAnimation().then(setAnimationData)
  }, [])

  if (!animationData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-subtext">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text">
      <Lottie animationData={animationData} loop style={{ width: 200, height: 200 }} />
    </div>
  )
}

