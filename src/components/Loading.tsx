'use client'
import { useEffect, useState } from 'react'
import Lottie from 'react-lottie-player'
import { getCachedLottie } from './LottiePreload'

export default function LoadingAnimation() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const cached = getCachedLottie()
    if (cached) {
      setData(cached)
    } else {
      fetch('/assets/loading.json')
        .then(res => res.json())
        .then(setData)
    }
  }, [])

  if (!data) return null

  return (
    <div className="flex justify-center items-center h-full">
      <Lottie loop play animationData={data} style={{ width: 100, height: 100 }} />
    </div>
  )
}

